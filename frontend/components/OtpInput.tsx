"use client";

import {
  useRef,
  useState,
  ChangeEvent,
  KeyboardEvent,
  ClipboardEvent,
} from "react";

export default function OtpInput({
  length = 6,
  onComplete,
}: {
  length?: number;
  onComplete?: (otp: string) => void;
}) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;

    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== "")) {
      onComplete?.(newOtp.join(""));
    }
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (
      !["Backspace", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key) &&
      !/^\d$/.test(e.key)
    ) {
      e.preventDefault(); // 🔥 block letters BEFORE they enter
    }

    if (e.key === "Backspace") {
      const newOtp = [...otp];

      if (otp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (
    e: ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();

    const paste = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (!paste) return;

    const newOtp = paste.split("");
    setOtp(newOtp);

    newOtp.forEach((val, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i]!.value = val;
      }
    });

    if (newOtp.length === length) {
      onComplete?.(newOtp.join(""));
    }
  };

  return (
    <div className="flex justify-center gap-3">
      {otp.map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={otp[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="h-12 w-12 rounded-xl bg-[#1A1A1A] text-center text-lg border border-gray-700 focus:border-purple-500 outline-none"
        />
      ))}
    </div>
  );
}
