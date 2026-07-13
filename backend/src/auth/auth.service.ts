import axios from "axios";
import { eq } from "drizzle-orm";
import { sendEmail } from "../../config/mailSender.config";
import { ApiError } from "../../utils/ApiError";
import { generateEmailTemplate } from "../../utils/emailTemplate";
import Helper from "../../utils/helper";
import { AuthRepository } from "./auth.repository";
import { AdminLoginInput, AdminUserWithRoles, CreateUserInput, PasswordResetInput, User, UserLoginInput } from "./auth.type";
import ContactService from "../contact/contact.service";
import { withTransaction } from "../../utils/withTransaction";
import db from "../../drizzle/src";
import { staffProfiles } from "./auth.table";

export class AuthService {
    static async sendEmailVerifyOTP(email: string) {

    const emailExist = await AuthRepository.findByEmail(email);

    if (emailExist) {

      throw new ApiError(400, "Email already registered, try with new one");

    }


    if (!email) {

      throw new ApiError(400, "Email is required");

    }


    // check Redis if OTP already exists
    const existingOTP = await Helper.getOTPFromRedis(email, "email");

    if (existingOTP) {

      throw new ApiError(429, "OTP already sent. Please wait before requesting again.");

    }

    // generate new OTP
    const otp: number | string = Helper.generateOTP();

    // save to Redis with 120 seconds TTL
    try {

      await Helper.setOTPIntoRedis(email, otp, "email");

    } catch (err) {

      throw new ApiError(500, "Redis save failed");

    }
    // prepare email template
    const html = generateEmailTemplate(otp, "verify");

    // send email
    const emailSended = await sendEmail({
      to: email,
      subject: "Your OTP Code",
      html,
    });

    if (!emailSended) {
      throw new ApiError(500, "Internal Server Error")
    }

  }

  static async registerManually(payload: CreateUserInput) {

    const otp: string = payload.otp;
    const redisOTP = await Helper.getOTPFromRedis(payload.email as string, "email");

    if (!redisOTP) {
      // OTP expired বা send করা হয়নি
      throw new ApiError(400, "OTP expired or not found");
    }

    if (otp !== redisOTP) {
      // OTP mismatch
      throw new ApiError(400, "Invalid OTP");
    }


    await Helper.deleteOTPFromRedis(payload.email, "email");

    let user: User | null = null;

    const existedMobile = await AuthRepository.findByMobile(payload.mobile);

    if (existedMobile) {
      throw new ApiError(409, "Mobile already exists");
    }


    const hashedPassword: string = await Helper.hashPassword(
      payload.password as string,
    );

    let token;

    await withTransaction(async (tx) => {

      user = await AuthRepository.createUser({
        ...payload,
        password: hashedPassword,
      }, tx);

      if (!user) {

        throw new ApiError(500, "User registration failed");

      }
      // _______________________________________-_______
      // 
      // ____________Contact Registration_________________
      // _______________________________________-_______
      token = Helper.generateToken(user);

      const contactExist = await ContactService.findOne({mobile:user.mobile!});

      if (contactExist) {

        await ContactService.update(contactExist.id, { userID: user.id, email: user.email! }, tx)

      }
      // jodi mobile number diye khola na thake tokhon mobile number lagbe,
      if (!contactExist) {

        await ContactService.create({
          balance: 0,
          type: "customer",
          mobile: user.mobile!,
          name: user.name,
          address: user.address!,
          email: user.email!,
          userID: user.id,
        },tx)

      }

    });

    return { token, user }

  }

  static async getProfileData(userID: string) {

    const user = await AuthRepository.findByID(userID);
    let checkOut = false;

    if (!user) {
      throw new ApiError(404, "User Not Found");
    }

    if (user.openID && !user.mobile) {
      checkOut = true
    }

    const contact = await ContactService.findOne({mobile:user.mobile!});

    return { ...user, ...(checkOut ? { checkoutMobile: true } :{ ...contact }) };

  }



  static async sendForgetPasswordOTP(email: string) {

    const user = await AuthRepository.findByEmail(email);

    if (!user) {
      throw new ApiError(404, "User not found")
    }

    // check Redis if OTP already exists
    const existingOTP = await Helper.getOTPFromRedis(email, "email");
    if (existingOTP) {

      throw new ApiError(429, "OTP already sent. Please wait before requesting again.")
    }

    // generate new OTP
    const otp: number | string = Helper.generateOTP();

    // save to Redis with 120 seconds TTL
    try {
      await Helper.setOTPIntoRedis(email, otp, "email");
    } catch (err) {
      throw new ApiError(500, "Redis save failed");
    }
    // prepare email template
    const html = generateEmailTemplate(otp, "reset");

    // send email
    const emailSended = await sendEmail({
      to: email,
      subject: "Your OTP Code",
      html,
    });
    if (!emailSended) {
      throw new ApiError(500, "Internal Server Error")
    }

  }

  static async resetPassword(payload: PasswordResetInput) {

    const otp: string = payload.otp;
    const redisOTP = await Helper.getOTPFromRedis(payload.email as string, "email");

    if (!redisOTP) {
      // OTP expired বা send করা হয়নি
      throw new ApiError(400, "OTP expired or not found");
    }

    if (otp !== redisOTP) {
      // OTP mismatch
      throw new ApiError(400, "Invalid OTP");
    }

    await Helper.deleteOTPFromRedis(payload.email, "email");

    const hashedPassword: string = await Helper.hashPassword(
      payload.password as string,
    );
    let user = await AuthRepository.findByEmail(payload.email);

    if (!user) {
      throw new ApiError(500, "User registration failed");
    }
    const updatedUser = await AuthRepository.updateUser(user.id, { password: hashedPassword });

    const userObj = updatedUser;

    const token: string = Helper.generateToken(userObj);

    const userData = { ...user, password: null }

    return { token, user: userData }
  }

  static async manualLogin(payload: UserLoginInput) {
    // check if identifier is email or phone
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.identifier);

    // find user
    const user = isEmail
      ? await AuthRepository.findByEmail(payload.identifier)
      : await AuthRepository.findByMobile(payload.identifier);

    if (!user) {
      throw new ApiError(404, "Wrong Credential")
    }

    if (user && !user.password && user.openID) {
      throw new ApiError(400, "Wrong Login Method, Login with Google")
    }

    const passwordMatched = await Helper.comparePassword(payload.password!, user.password as string);

    if (!passwordMatched) {
      throw new ApiError(404, "Wrong Credential")
    }


    const token: string = Helper.generateToken(user);

    return { token, user }

  }

  static getGoogleAuthAPI() {
    const redirectURL =
      "https://accounts.google.com/o/oauth2/v2/auth?" +
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        redirect_uri: `${process.env.GOOGLE_REDIRECT_URL}`,
        response_type: "code",
        scope: "openid email profile",
        state: "google_private_random_string_you_can_give_anything",
      });

    return redirectURL;

  }

  static async googleAuthCallbackAPI(query: any) {
    const code = query.code

    if (!code) {
      throw new ApiError(400, "Authorization code missing");
    }

    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.GOOGLE_REDIRECT_URL}`,
        grant_type: "authorization_code",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );

    const { access_token } = tokenResponse.data;

    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    const googleUser: any = userInfoResponse.data;

    let user = await AuthRepository.findByEmail(googleUser.email);

    if (!user) {
      user = await AuthRepository.createUser({
        name: googleUser.name,
        email: googleUser.email,
        openID: googleUser.id,
        image: googleUser.picture,
      })
    }

    if (user && !user.openID) {
      user.openID = googleUser.id;
      await AuthRepository.updateUser(user.id, { openID: googleUser.id })
    }

    const token = Helper.generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
    });
    // 5️⃣ Store user session in Redis (🔥 NEW PART)
    // const redisRes = await redis.set(
    //   `session:${user._id}`,
    //   JSON.stringify({
    //     _id: user._id,
    //     name: user.name,
    //     email: user.email,
    //     admin: user.admin,
    //   }),
    //   "EX",
    //   60 * 60 * 24 // 1 day expire
    // );

    const clientRedirectURL = process.env.ECOM_CLIENT_URL;

    return { token, clientRedirectURL }

  }

  static async checkOutMobile(userID: string, mobile: string, address?: string) {

    const targetUser = await AuthRepository.findByID(userID);

    const user = await AuthRepository.findByMobile(mobile);

    if (user) {

      throw new ApiError(400, "try with different mobile number");

    }

    const contact = await ContactService.findOne({mobile});

    if (contact) {

      throw new ApiError(400, "try with different mobile number");

    }

    if (!user && !contact) {

      await AuthRepository.updateUser(userID, { mobile });

      await ContactService.create({
        userID,
        balance: 0,
        mobile,
        name: targetUser!.name,
        type: "customer",
        address: targetUser!.address ?? address,
      })
    }


  }

  // ===========================
  // Admin / Staff Auth
  // ===========================

  static async adminLogin(payload: AdminLoginInput): Promise<{ token: string; user: AdminUserWithRoles }> {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.identifier);

    const userWithRoles = isEmail
      ? await AuthRepository.findUserWithRolesByEmail(payload.identifier)
      : await AuthRepository.findUserWithRolesByMobile(payload.identifier);
   
    if (!userWithRoles) {
      throw new ApiError(404, "Wrong credentials");
    }

    if (!userWithRoles.password && userWithRoles.openID) {
      throw new ApiError(400, "Wrong login method. Please login with Google.");
    }

    if (!userWithRoles.password) {
      throw new ApiError(400, "No password set for this account");
    }

    const passwordMatched = await Helper.comparePassword(payload.password, userWithRoles.password);

    if (!passwordMatched) {
      throw new ApiError(404, "Wrong credentials");
    }

    if (userWithRoles.roles.length === 0) {
      throw new ApiError(403, "Access denied. No role assigned to this account.");
    }

    const staffProfile = await db.query.staffProfiles.findFirst({
      where: eq(staffProfiles.userID, userWithRoles.id),
    });

    const token = Helper.generateToken({
      id: userWithRoles.id,
      name: userWithRoles.name,
      email: userWithRoles.email,
      mobile: userWithRoles.mobile,
    });

    const user: AdminUserWithRoles = {
      id: userWithRoles.id,
      name: userWithRoles.name,
      email: userWithRoles.email,
      mobile: userWithRoles.mobile,
      image: userWithRoles.image,
      roles: userWithRoles.roles,
      permissions: userWithRoles.permissions,
      isSuperAdmin: userWithRoles.isSuperAdmin,
      staffProfile: staffProfile
        ? {
            employeeCode: staffProfile.employeeCode,
            designation: staffProfile.designation,
            department: staffProfile.department,
          }
        : null,
    };

    return { token, user };
  }

  static getAdminGoogleAuthURL() {
    const redirectURL =
      "https://accounts.google.com/o/oauth2/v2/auth?" +
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        redirect_uri: process.env.GOOGLE_ADMIN_REDIRECT_URL!,
        response_type: "code",
        scope: "openid email profile",
        state: "admin_google_auth",
      });

    return redirectURL;
  }

  static async adminGoogleCallback(query: any): Promise<{ token: string; user: AdminUserWithRoles; clientRedirectURL: string }> {
    const code = query.code;

    if (!code) {
      throw new ApiError(400, "Authorization code missing");
    }

    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_ADMIN_REDIRECT_URL!,
        grant_type: "authorization_code",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );

    const { access_token } = tokenResponse.data;

    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    const googleUser: any = userInfoResponse.data;

    let userWithRoles = await AuthRepository.findUserWithRolesByEmail(googleUser.email);

    if (!userWithRoles) {
      throw new ApiError(403, "No admin/staff account found for this Google email. Please contact your administrator.");
    }

    if (!userWithRoles.openID) {
      await AuthRepository.updateUser(userWithRoles.id, { openID: googleUser.id });
      userWithRoles = { ...userWithRoles, openID: googleUser.id };
    }

    if (userWithRoles.roles.length === 0) {
      throw new ApiError(403, "Access denied. No role assigned to this account.");
    }

    const staffProfile = await db.query.staffProfiles.findFirst({
      where: eq(staffProfiles.userID, userWithRoles.id),
    });

    const token = Helper.generateToken({
      id: userWithRoles.id,
      name: userWithRoles.name,
      email: userWithRoles.email,
      mobile: userWithRoles.mobile,
    });

    const user: AdminUserWithRoles = {
      id: userWithRoles.id,
      name: userWithRoles.name,
      email: userWithRoles.email,
      mobile: userWithRoles.mobile,
      image: userWithRoles.image,
      roles: userWithRoles.roles,
      permissions: userWithRoles.permissions,
      isSuperAdmin: userWithRoles.isSuperAdmin,
      staffProfile: staffProfile
        ? {
            employeeCode: staffProfile.employeeCode,
            designation: staffProfile.designation,
            department: staffProfile.department,
          }
        : null,
    };

    const clientRedirectURL = process.env.ADMIN_CLIENT_URL!;

    return { token, user, clientRedirectURL };
  }
}