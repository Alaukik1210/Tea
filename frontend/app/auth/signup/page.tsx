"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, JSX, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { user_url } from "@/lib/constants";

export default function SignupPage(): JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password || !username) {
      alert("All fields are required");
      return;
    }

    console.log({ email, password, username });

    const  response = await axios.post(`${user_url}/signup`, { email, password, username });
    if (response) {
      alert("OTP sent to your email");
    }

    router.push(`/auth/signup/verifyotp/${email}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#7B22FA] to-black opacity-90" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-transparent backdrop-blur-xl shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold">Welcome</h1>
          <p className="text-sm text-gray-400 mt-1">Signup to continue</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              className="mt-1 w-full rounded-xl bg-[#1A1A1A] px-4 py-3 text-sm outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#1A1A1A] px-4 py-3 text-sm outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#1A1A1A] px-4 py-3 text-sm outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#7B22FA] py-3 font-medium hover:opacity-90 transition"
          >
            Get OTP
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-purple-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
