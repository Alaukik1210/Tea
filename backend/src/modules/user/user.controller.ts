import tryCatch from "../../lib/TryCatch.js";
import { redisClient } from "../../config/redis.js";
import { publishOtpMail } from "../../queues/producers/producer.js";
import { prisma } from "../../lib/db.js";
import bcrypt from "bcryptjs";

export const signupUser = tryCatch(async (req, res) => {
  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }

  //rate limiting
  const rateLimitKey = `otp:ratelimit:${email}`;
  const ratelimit = await redisClient.get(rateLimitKey);
  if (ratelimit) {
    return res
      .status(429)
      .json({ error: "Too many requests, please try again later." });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).json({ error: "email already exists" });
  }

  const existingUserName = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUserName) {
    return res.status(400).json({ error: "Username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await redisClient.set(
    `signup:${email}`,
    JSON.stringify({ email, password: hashedPassword, username }),
    { EX: 300 }
  );

  //generate otp
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpKey = `otp:${email}`;
  await redisClient.set(otpKey, otp, { EX: 300 });
  await redisClient.set(rateLimitKey, "true", { EX: 60 });

  //send otp
  await publishOtpMail({
    to: email,
    subject: "OTP for signup",
    body: `Your OTP is ${otp}. It is valid for 5 minutes`,
  });

  res.json({ message: "OTP sent successfully" });
});






export const verifyOtp = tryCatch(async (req, res) => {
  const { email, otp } = req.body;

  const storedOtp = await redisClient.get(`otp:${email}`);
  if (!storedOtp || storedOtp !== otp) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  const signupData = await redisClient.get(`signup:${email}`);
  if (!signupData) {
    return res.status(400).json({ error: "Signup session expired" });
  }

  const { username, password } = JSON.parse(signupData);

  // 3️⃣ Create user in DB
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password, // already hashed
    },
  });

  // 4️⃣ Cleanup Redis
  await redisClient.del(`otp:${email}`);
  await redisClient.del(`signup:${email}`);

  // 5️⃣ Success
  return res.status(201).json({
    message: "Account created successfully",
    userId: user.id,
  });
});