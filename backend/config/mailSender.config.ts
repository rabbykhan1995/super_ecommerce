import nodemailer, { SentMessageInfo } from 'nodemailer';
import { ApiError } from '../utils/ApiError';

interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: SendMailOptions): Promise<SentMessageInfo> => {
  try {
    const info = await transporter.sendMail({
      from: `"SHISHIR GYMNASTIC" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    return info; // ✅ return success info to controller
  } catch (error) {
    throw new ApiError(401,"Failed to send email");
  }
};