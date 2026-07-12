import slugify from "slugify";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UserInToken } from "../src/auth/auth.type";
dotenv.config();
import bcrypt from "bcrypt";
import crypto from "crypto";
import redis from "../config/redis.config";
import PurchaseCounter from "../src/purchase/purchaseCounter.model";
import dayjs from "dayjs";
import { CreateSaleInput, Sale } from "../src/sale/sale.type";
import { Types } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET;
const BCRYPT_SECRET = process.env.BCRYPT_SECRET;
// fine
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}

export default class Helper {
  static randomSuffix(): string {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    const l1 = letters[Math.floor(Math.random() * letters.length)];
    const l2 = letters[Math.floor(Math.random() * letters.length)];
    const number = Math.floor(1 + Math.random() * 1000);

    return `${l1}${number}${l2}`;
  }

  static generateSlug(title: string): string {
    return slugify(title, {
      lower: true,
      strict: true,
    });
  }

  static generateToken(user: UserInToken): string {
    return jwt.sign(user, JWT_SECRET!, {
      // <-- note the !
      expiresIn: "1d",
    });
  }

  static verifyToken(token: string): UserInToken | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET!) as UserInToken;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10; // security factor
    const hashed = await bcrypt.hash(password + BCRYPT_SECRET, saltRounds);
    return hashed;
  }

  // 2️⃣ Compare Password
  static async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password + BCRYPT_SECRET, hashedPassword);
  }

  static getPublicIdFromUrl(url: string) {
    const parts = url.split("/");
    const fileName = parts[parts.length - 1]; // abc123.jpg
    const folder = parts[parts.length - 2]; // trainings or blogs
    return `${folder}/${fileName.split(".")[0]}`;
  }
  static generateRandomID(): string {
    const uniqueId: string = crypto.randomUUID();
    return uniqueId;
  }

  static generateOTP(): number {
    // 100000–999999 random 6 digit number
    return Math.floor(100000 + Math.random() * 900000);
  }

  // set otp (email / phone)
  static async setOTPIntoRedis(identifier: string, otp: string | number, type: "email" | "phone") {
    const key = `otp:${type}:${identifier}`;

    await redis.set(key, otp, "EX", 300); // 5 minutes expiry

    return true;
  }

  static async getOTPFromRedis(identifier: string, type: "email" | "phone") {
    const key = `otp:${type}:${identifier}`;
    return await redis.get(key);
  }

  static async deleteOTPFromRedis(
    identifier: string,
    type: "email" | "phone"
  ) {
    const key = `otp:${type}:${identifier}`;

    await redis.del(key);

    return true;
  }

  static async generateInvoiceNo(): Promise<string> {
    const counter = await PurchaseCounter.findOneAndUpdate(
      {},
      { $inc: { counter: 1 } },
      { new: true, upsert: true }
    );

    return `INV-${counter!.counter}`;

    // INV-1, INV-2, INV-3...
  }

  static getWeekNumber(date: Date) {

    const firstDay = new Date(date.getFullYear(), 0, 1);
    const pastDays = (date.getTime() - firstDay.getTime()) / 86400000;

    return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
  }

  static roundQty(n: number): number {
    return Number(n.toFixed(6))
  }

  static formatDate(date: Date): string {
    if (!date) return "";

    const d = new Date(date); // ISO string handle
    const day = String(d.getDate()).padStart(2, "0"); // 1 -> 01
    const month = String(d.getMonth() + 1).padStart(2, "0"); // 0-indexed
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  }

  static getWarrantyExpireDate(saleDate: Date, warrantyDay: number): Date {
    return dayjs(saleDate).add(warrantyDay, "day").toDate()
  }

  static resolveCustomerBalanceMovement(
    sale: Partial<Sale>,
    accounts: { accountID: string | Types.ObjectId;amount: number }[] | null = [],
  ):number {
    let paidWithAcc = 0;
    let paidWithBal = 0;
    if (accounts?.length) {
      paidWithAcc = accounts.reduce((acc, a) => acc + a.amount, 0);
    }

    if (sale.paid! > paidWithAcc) {
      paidWithBal = sale.paid! - paidWithAcc;
    }


    const totalPaid = paidWithAcc + paidWithBal;

    const net = sale.totalAmount! - totalPaid;

    // 🔥 THIS IS THE ONLY THING YOU NEED
    const balanceChange = -net;

    return balanceChange;


  }

}
