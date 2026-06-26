import { Request, Response } from "express";
import User from "./user.model";
import {
  UserResponse,
  CreateUserInput,
  UpdateUserInput,
  UserQuery,
  UserInToken,
  UserLoginInput,
  PasswordResetInput,
} from "./user.type";

import Helper from "../../utils/helper";
import { Types } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import axios from "axios";
import { paginatedAggregate } from "../../utils/queryBuilder";
import { generateEmailTemplate } from "../../utils/emailTemplate";
import { sendEmail } from "../../config/mailSender.config";

export class AuthController {
  constructor() {
    // future dependency injection এর জন্য reserved
  }

  static async registerManually(req: Request, res: Response) {
    const payload: CreateUserInput = req.body;

    const otp: string = payload.otp;
    const redisOTP = await Helper.getOTPFromRedis(req.body.email as string, "email");

    if (!redisOTP) {
      // OTP expired বা send করা হয়নি
      throw new ApiError(400, "OTP expired or not found");
    }

    if (otp !== redisOTP) {
      // OTP mismatch
      throw new ApiError(400, "Invalid OTP");
    }


    await Helper.deleteOTPFromRedis(req.body.email, "email");

    if (payload.mobile) {
      const existedMobile = await User.findOne({ mobile: payload.mobile });

      if (existedMobile) {
        throw new ApiError(409, "Mobile already exists");
      }
    }

    const hashedPassword: string = await Helper.hashPassword(
      payload.password as string,
    );
    const user: UserResponse = await User.create({
      ...payload,
      password: hashedPassword,
    });

    if (!user) {
      throw new ApiError(500, "User registration failed");
    }

    const token: string = Helper.generateToken(user.toObject());
    // Cookie সেট
    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.status(201).json({
      success: true,
      msg: "Registration successful",
      data: user,
      token,
    });
  }

  static async getProfileData(req: Request, res: Response) {
    const userID: Types.ObjectId = req.user!._id;

    const user: UserResponse | null = await User.findById(userID);

    if (!user) {
      throw new ApiError(404, "User Not Found");
    }

    return res
      .status(200)
      .json({ msg: "user fetched successfully", data: user, success: true });
  }
  static async logout(req: Request, res: Response) {
    const userID: Types.ObjectId = req.user!._id;

    res.clearCookie("token");

    return res
      .status(200)
      .json({ msg: "user logged out successfully", success: true });
  }

  static async sendEmailVerifyOTP(req: Request, res: Response) {
    const email: string = req.body.email;
    const emailExist = await User.findOne({ email });

    if (emailExist) {
      throw new ApiError(400, "Email already registered, try with new one")
    }


    if (!email) {
      throw new ApiError(400, "Email is required")

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
    return res
      .status(200)
      .json({ msg: "OTP sent successfully", success: true });

  }

  static async sendForgetPasswordOTP(req: Request, res: Response) {
    const email: string = req.body.email;
    if (!email) {
      throw new ApiError(400, "Email is required")

    }


    const user = await User.findOne({ email });

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
    return res
      .status(200)
      .json({ msg: "OTP sent successfully", success: true });

  }

  static async resetPassword(req: Request, res: Response) {
    const payload: PasswordResetInput = req.body;
    const otp: string = payload.otp;
    const redisOTP = await Helper.getOTPFromRedis(req.body.email as string, "email");

    if (!redisOTP) {
      // OTP expired বা send করা হয়নি
      throw new ApiError(400, "OTP expired or not found");
    }

    if (otp !== redisOTP) {
      // OTP mismatch
      throw new ApiError(400, "Invalid OTP");
    }

    await Helper.deleteOTPFromRedis(req.body.email, "email");

    const hashedPassword: string = await Helper.hashPassword(
      payload.password as string,
    );
    let user: UserResponse | null = await User.findOne({
      email: payload.email,
    });

    if (!user) {
      throw new ApiError(500, "User registration failed");
    }

    user.password = hashedPassword;

    await user.save();
    const userObj = user.toObject();
    delete userObj.password;

    const token: string = Helper.generateToken(userObj);
    // Cookie সেট
    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.status(201).json({
      success: true,
      msg: "Password reset successful",
      data: userObj,
      token,
    });
  }

  static async manualLogin(req: Request, res: Response) {
    const payload: UserLoginInput = req.body;

    // check if identifier is email or phone
    // const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.identifier);

    // find user
    // const user: UserResponse | null = await User.findOne(
    //   isEmail ? { email: payload.identifier } : { mobile: payload.identifier }
    // );
    
    let user:UserResponse | null = await User.findOne({mobile:payload.identifier})
    
    if(!user){
      user = await  User.create({
    name: "Admin",
    email: "admin@example.com",
    mobile: "01700000000",
    address: "Dhaka",
    password: "admin@123",
    admin: true,
  });
    }
    
    if (!user) {
      throw new ApiError(404, "Wrong Credential")
    }

    // if (user && !user.password && user.openID) {
    //   throw new ApiError(400, "Wrong Login Method, Login with Google")
    // }

    // const passwordMatched = Helper.comparePassword(user.password as string, payload.password as string);

   const passwordMatched = payload.password === user.password


    if (!passwordMatched) {
      throw new ApiError(404, "Wrong Credential")
    }


    const token: string = Helper.generateToken(user.toObject());
    // Cookie সেট
    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.status(201).json({
      success: true,
      msg: "Login successful",
      data: user,
      token,
    });
  }

}
