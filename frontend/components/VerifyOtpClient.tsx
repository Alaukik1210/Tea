"use client";

import axios from "axios";
import OtpInput from "./OtpInput";
import { user_url } from "@/lib/constants";
import { useRouter } from "next/navigation";
export default function VerifyOtpClient({
  email,
}: {
  email: string;
}) {

    const router = useRouter();
  const handleOtpComplete = async (otp: string) => {
    console.log("OTP entered:", otp);
    // 🔥 call verify OTP API here

   const  response = await axios.post(`${user_url}/verify`, { email, otp });
    if (response) {
      alert("welcome");
      router.push('/');
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#7B22FA] to-black opacity-90" />

      <div className="relative z-10 w-full max-w-md rounded-3xl bg-transparent backdrop-blur-xl shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            OTP sent to
          </h1>
          <p className="text-purple-400 mt-1">{email}</p>

          <p className="text-sm text-gray-400 mt-2">
            Verify to continue
          </p>

          <div className="mt-6">
            <OtpInput onComplete={handleOtpComplete} />
          </div>
        </div>
      </div>
    </div>
  );
}
