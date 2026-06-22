"use client";

import api, { base_url } from "@/utils/apiconfig";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { userStore } from "@/zustand/user.store";
const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const router = useRouter();
  const { setUser } = userStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await api.post('/user/manual-login', {
      identifier,
      password,
    })

    if (res.data.success === false) {
      return;
    }
    setUser(res.data.data);
    if (res.data.data.admin === true) {
      return router.push('/admin')
    }
    router.push('/user');
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    window.location.href = `${base_url}/user/google-auth-api`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          Login to Your Account
        </h2>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email or Mobile</label>
            <input
              type="text"
              placeholder="Enter email or mobile"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 outline-none rounded-lg"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 outline-none rounded-lg"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#313131] text-white py-2 rounded-lg"
          >
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>
        <Link
          href={"/forget-password"}
          className="block w-full bg-[#313131] text-white py-2 rounded-lg text-center"
        >
          Forget Password
        </Link>
        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <Link
          href={"/registration"}
          className="block w-full bg-[#313131] text-white py-2 rounded-lg text-center"
        >
          Sign Up
        </Link>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>
        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full border border-gray-300 flex items-center justify-center gap-2 py-2 rounded-lg transition"
        >
          {googleLoading ? (
            "..."
          ) : (
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="google"
              className="w-5 h-5"
            />
          )}
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
