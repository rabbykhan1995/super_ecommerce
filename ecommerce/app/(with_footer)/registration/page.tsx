"use client";

import api from "@/utils/apiconfig";
import OTPInput from "@/utils/Ui/OTPInput";
import { redirect } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { userStore } from "@/zustand/user.store";

const page = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSended, setOtpSended] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const router = useRouter();
 const {setUser} = userStore()
  const handleSendOTP = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return toast.error("password is not matched")
    }

    const res = await api.post('/user/send-email-verify-otp', {
      email,
    });
    if (res.data.success === true) {

      setOtpSended(true)
    }
  };


  const handleRegister = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("password is not matched")
    }

    const res = await api.post('/user/register-manually', {
      name,
      email,
      mobile,
      password,
      confirmPassword,
      otp
    });

    
    if(res.data.success === true){
      setUser(res.data.data);
      router.push('/user');
    }else{
      return;
    }

  };

  const handleGoogleSignup = () => {
    console.log("Google signup clicked");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          Create Your Account
        </h2>

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 outline-none rounded-lg"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter email"
              value={email}
              disabled={otpSended}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 outline-none rounded-lg"
              required
            />
          </div>

          {otpSended ? <div>
            <button type="button" disabled className="w-full bg-[#5c5c5c] text-white py-2 rounded-lg mb-5">6 Digit otp sended to your gmail</button>
            <OTPInput value={otp}
              onChange={(val) => setOtp(val)} validTime={120} />
          </div> : <div>
            <button type="button" onClick={handleSendOTP} className="w-full bg-[#313131] text-white py-2 rounded-lg">Send OTP</button>
          </div>}
          {!otpSended ? null : <> {/* mobile */}
            <div>
              <label className="text-sm font-medium">Mobile</label>
              <input
                type="text"
                placeholder="Enter mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 outline-none rounded-lg"

              />
            </div>
            {/* password */}
            <div>
              <label className="text-sm font-medium">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 outline-none rounded-lg"
                required
              />
            </div>
            {/* confirm password */}
            <div>
              <label className="text-sm font-medium">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 outline-none rounded-lg"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#313131] text-white py-2 rounded-lg"
            >
              Sign Up
            </button></>}
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google Signup */}
        <button
          onClick={handleGoogleSignup}
          className="w-full border border-gray-300 flex items-center justify-center gap-2 py-2 rounded-lg transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default page;
