// app/auth/signup/verifyotp/[email]/page.tsx

import VerifyOtpClient from "@/components/VerifyOtpClient";

export default async function VerifyOtp({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const { email } = await params;
  const decodedEmail = decodeURIComponent(email);

  return (
    <VerifyOtpClient email={decodedEmail} />
  );
}
