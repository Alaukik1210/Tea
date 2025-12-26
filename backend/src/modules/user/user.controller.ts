import tryCatch from "../../lib/TryCatch.js";
import { redisClient } from "../../config/redis.js";
import { publishOtpMail } from "../../queues/producers/producer.js";
import { prisma } from "../../lib/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { BadRequestError, HttpError, NotfoundError } from "../../lib/errors.js";
import { error } from "node:console";
import { AuthenticatedRequest } from "../../middleware/isAuth.js";

export const signupUser = tryCatch(async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    throw new BadRequestError("All fields are required");
  }

  if (password.length < 8) {
    throw new BadRequestError("Password must be at least 8 characters");
  }

  const rateLimitKey = `otp:ratelimit:${email}`;
  if (await redisClient.get(rateLimitKey)) {
    throw new HttpError(429, "Too many requests, please try again later.");
  }

  if (await prisma.user.findUnique({ where: { email } })) {
    throw new BadRequestError("Email already exists");
  }

  if (await prisma.user.findUnique({ where: { username } })) {
    throw new BadRequestError("Username already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await redisClient.set(
    `signup:${email}`,
    JSON.stringify({ email, username, password: hashedPassword }),
    { EX: 300 }
  );

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await redisClient.set(`otp:${email}`, otp, { EX: 300 });
  await redisClient.set(rateLimitKey, "true", { EX: 60 });

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
    throw new BadRequestError("Invalid or expired OTP");
  }

  await redisClient.del(`otp:${email}`);

  const signupData = await redisClient.get(`signup:${email}`);
  if (!signupData) {
    throw new BadRequestError("Signup session expired");
  }

  const { username, password } = JSON.parse(signupData);

  let user;
  try {
    user = await prisma.user.create({
      data: { email, username, password },
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      throw new BadRequestError("User already exists");
    }
    throw err;
  }

  await redisClient.del(`signup:${email}`);
  await redisClient.del(`otp:ratelimit:${email}`);

  const token = jwt.sign({ id: user.id }, env.JWT_SECRET, { expiresIn: "7d" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    message: "Account created successfully",
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
  });
});

export const loginUser = tryCatch(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new BadRequestError("All fields are required");
  }
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  if (!user) {
    throw new BadRequestError("Invalid credentials");
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new BadRequestError("Invalid credentials");
  }
  const token = jwt.sign({ id: user.id }, env.JWT_SECRET, { expiresIn: "7d" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: "Logged in",
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
  });
});



export const myProfile = tryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) {
    throw new BadRequestError("Not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new NotfoundError("User not found");
  }

  res.json(user);
});

export const updateName = tryCatch(async (req: AuthenticatedRequest, res) => {
  const { username } = req.body;

  if (!req.user?.id) {
    throw new BadRequestError("Not authenticated");
  }

  if (!username) {
    throw new BadRequestError("Username is required");
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: { username },
    select: {
      id: true,
      email: true,
      username: true,
    },
  });

  res.json({
    message: "Username updated",
    user: updatedUser,
  });
});



export const getAllUsers = tryCatch(async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      avatarUrl: true,
    },
  });

  res.json(users);
});


export const getAUser = tryCatch(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new NotfoundError("User not found");
  }

  res.json(user);
});



export const updateUser = tryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user?.id) {
      throw new BadRequestError("Not authenticated");
    }

    const {
      username,
      email,
      bio,
      avatarUrl,
      name,
      status,
    } = req.body;

    if (
      !username &&
      !email &&
      !bio &&
      !avatarUrl &&
      !name &&
      !status
    ) {
      throw new BadRequestError("No fields provided to update");
    }

    const updateData: Record<string, any> = {};

    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (name !== undefined) updateData.name = name;
    if (status) updateData.status = status;

    let updatedUser;
    try {
      updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          bio: true,
          avatarUrl: true,
          name: true,
          status: true,
          updatedAt: true,
        },
      });
    } catch (err: any) {
      if (err.code === "P2002") {
        throw new BadRequestError("Username or email already exists");
      }
      throw err;
    }

    if (!updatedUser) {
      throw new NotfoundError("User not found");
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  }
);
