import tryCatch from "../../lib/TryCatch.js";
import { redisClient } from "../../config/redis.js";
import { publishOtpMail } from "../../queues/producers/producer.js";
import { prisma } from "../../lib/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { BadRequestError, HttpError, NotfoundError } from "../../lib/errors.js";
import { AuthenticatedRequest } from "../../middleware/isAuth.js";

export const signupUser = tryCatch(async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    throw new BadRequestError("All fields are required");
  }

  if (password.length < 8) {
    throw new BadRequestError("Password must be at least 8 characters");
  }

  if (username.length < 3 || username.length > 20) {
    throw new BadRequestError("Username must be 3–20 characters");
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
  const name = username;
  let user;
  try {
    user = await prisma.user.create({
      data: { email, username, password, name },
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
      name: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,

      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },

      followers: {
        take: 10,
        select: {
          follower: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      },

      following: {
        take: 10,
        select: {
          following: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      },

      posts: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          content: true,
          createdAt: true,
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new NotfoundError("User not found");
  }

  const followers =
    Number(await redisClient.get(`followers:${user.id}`)) ??
    user._count.followers;

  res.json(user);
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

export const updateUser = tryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) {
    throw new BadRequestError("Not authenticated");
  }

  const { username, email, bio, avatarUrl, name, status } = req.body;

  if (!username && !email && !bio && !avatarUrl && !name && !status) {
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
});

export const logout = tryCatch(async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

export const searchUsers = tryCatch(async (req, res) => {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    throw new BadRequestError("Search query is required");
  }

  const searchKey = `search:${req.ip}`;
  if (await redisClient.get(searchKey)) {
    throw new HttpError(429, "Slow down");
  }
  await redisClient.set(searchKey, "1", { EX: 1 });

  if (q.length > 30) {
    throw new BadRequestError("Query too long");
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        {
          username: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          name: {
            contains: q,
            mode: "insensitive",
          },
        },
      ],
    },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
    },
    take: 10, // limit results
  });

  res.json(users);
});

export const followUser = tryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) {
    throw new BadRequestError("Not authenticated");
  }

  const targetUserId = req.params.id;
  const currentUserId = req.user.id;

  if (!targetUserId) {
    throw new BadRequestError("User id is required");
  }

  if (targetUserId === currentUserId) {
    throw new BadRequestError("You cannot follow yourself");
  }

  const rateKey = `follow:${currentUserId}:${targetUserId}`;

  //  Per-target rate limit (anti-spam)
  if (await redisClient.get(rateKey)) {
    throw new HttpError(429, "Too many requests");
  }

  // DB is source of truth
  try {
    await prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      throw new BadRequestError("Already following this user");
    }
    throw err;
  }

  //  Redis updates atomically AFTER DB success
  await redisClient
    .multi()
    // rate-limit key 
    .set(rateKey, "1", { EX: 3, NX: true })

    // cache follow state
    .set(
      `isFollowing:${currentUserId}:${targetUserId}`,
      "1",
      { EX: 300 }
    )

    // follower counters
    .incr(`followers:${targetUserId}`)
    .incr(`following:${currentUserId}`)

    .exec();

  res.status(201).json({
    message: "Followed successfully",
    isFollowing: true,
  });
});

export const unfollowUser = tryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) {
    throw new BadRequestError("Not authenticated");
  }

  const targetUserId = req.params.id;
  const currentUserId = req.user.id;

  if (!targetUserId) {
    throw new BadRequestError("User id is required");
  }

  if (targetUserId === currentUserId) {
    throw new BadRequestError("You cannot unfollow yourself");
  }

  //  DB delete (source of truth)
  const result = await prisma.follow.deleteMany({
    where: {
      followerId: currentUserId,
      followingId: targetUserId,
    },
  });

  if (result.count === 0) {
    throw new NotfoundError("You are not following this user");
  }

  //  Redis cleanup + counter rollback (atomic)
  await redisClient
    .multi()
    // remove follow cache
    .del(`isFollowing:${currentUserId}:${targetUserId}`)

    // rollback counters
    .decr(`followers:${targetUserId}`)
    .decr(`following:${currentUserId}`)

    //  clear rate-limit key so user can re-follow immediately
    .del(`follow:${currentUserId}:${targetUserId}`)

    .exec();

  res.json({
    message: "Unfollowed successfully",
    isFollowing: false,
  });
});

export const getFollowers = tryCatch(async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    throw new BadRequestError("User id is required");
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const userExists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!userExists) {
    throw new NotfoundError("User not found");
  }

  const [total, followers] = await Promise.all([
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.findMany({
      where: { followingId: userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        createdAt: true,
        follower: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    }),
  ]);

  res.json({
    meta: { total, page, limit },
    followers: followers.map((f) => ({
      ...f.follower,
      followedAt: f.createdAt,
    })),
  });
});

export const getFollowing = tryCatch(async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    throw new BadRequestError("User id is required");
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const userExists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!userExists) {
    throw new NotfoundError("User not found");
  }

  const [total, following] = await Promise.all([
    prisma.follow.count({ where: { followerId: userId } }),
    prisma.follow.findMany({
      where: { followerId: userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        createdAt: true,
        following: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    }),
  ]);

  res.json({
    meta: { total, page, limit },
    following: following.map((f) => ({
      ...f.following,
      followedAt: f.createdAt,
    })),
  });
});
