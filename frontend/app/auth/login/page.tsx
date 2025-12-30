"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
     <div className="min-h-screen flex items-center justify-center px-4" >
      {/* Background Gradient */}
      <div className="absolute inset-0    bg-gradient-to-br from-[#7B22FA] to-black opacity-90" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-transparent backdrop-blur-xl shadow-2xl p-6 sm:p-8">
        
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Login to continue
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-xl bg-[#1A1A1A] px-4 py-3 text-sm outline-none border border-transparent focus:border-purple-500 transition"
            />
          </div>




          {/* Password */}
          <div>
            <label className="text-sm text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl bg-[#1A1A1A] px-4 py-3 text-sm outline-none border border-transparent focus:border-purple-500 transition"
            />
          </div>

          {/* Forgot */}
          <div className="text-right">
            <button
              type="button"
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              Forgot password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-[#7B2FF7] to-[#A855F7] py-3 font-medium hover:opacity-90 transition"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-700" />
          <span className="text-xs text-gray-400">OR</span>
          <div className="h-px flex-1 bg-gray-700" />
        </div>

       
        {/* Signup */}
         <p className="mt-6 text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <Link href={"/auth/signup"}>
          <span className="text-purple-400 cursor-pointer hover:underline">
            Sign up
          </span>
          </Link>
        </p>
      </div>
    </div>
  );
}
