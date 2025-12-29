import tryCatch from "../../lib/TryCatch.js";
import { prisma } from "../../lib/db.js";
import { redisClient } from "../../config/redis.js";
import { BadRequestError } from "../../lib/errors.js";
import type { AuthenticatedRequest } from "../../middleware/isAuth.js";
import { getGlobalFeedFromRedis } from "./feed.service.js";

const FEED_CACHE_TTL = 60; // seconds

export const getHomeFeed = tryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) {
    throw new BadRequestError("Not authenticated");
  }

  // Parse and cap query params
  const limitRaw = (req.query.limit as string) ?? "20";
  const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 20, 1), 50);
  const cursor = (req.query.cursor as string) || null;

  const userId = req.user.id;
  const cacheKey = `feed:user:${userId}:limit:${limit}:cursor:${cursor ?? "none"}`;

  // 1) Try redis cache
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  // 2) Determine authors to include (following + self)
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  const authorIds = [userId, ...following.map((f) => f.followingId)];

  // 3) Query threads with pagination
  const queryOpts: any = {
    where: { authorId: { in: authorIds } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
    select: {
      id: true,
      content: true,
      postType: true,
      mediaUrl: true,
      createdAt: true,
      author: {
        select: { id: true, username: true, avatarUrl: true },
      },
      _count: {
        select: { likes: true, comments: true },
      },
      likes: {
        where: { userId },
        select: { id: true },
        take: 1,
      },
    },
  };

  if (cursor) {
    queryOpts.cursor = { id: cursor };
    queryOpts.skip = 1;
  }

  const threads = (await prisma.thread.findMany(queryOpts as any)) as any[];

  const items = threads.map((t) => ({
    id: t.id,
    content: t.content,
    postType: t.postType,
    mediaUrl: t.mediaUrl ?? null,
    createdAt: t.createdAt,
    author: t.author,
    stats: { likes: t._count.likes, comments: t._count.comments },
    likedByMe: t.likes.length > 0,
  }));

  const nextCursor = items.length > 0 ? items[items.length - 1].id : null;

  const payload = { items, nextCursor };

  // 4) Cache result in Redis
  await redisClient.set(cacheKey, JSON.stringify(payload), { EX: FEED_CACHE_TTL });

  res.json(payload);
});

export const getGlobalFeed = tryCatch(async (req: AuthenticatedRequest, res) => {
  // Parse and validate pagination params
  const pageRaw = (req.query.page as string) ?? "1";
  const limitRaw = (req.query.limit as string) ?? "20";

  const page = Math.max(parseInt(pageRaw, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 20, 1), 50);

  // Get feed from Redis-first architecture
  const result = await getGlobalFeedFromRedis(page, limit);

  res.json({
    items: result.items,
    nextPage: result.nextPage,
    currentPage: page,
    limit,
    source: result.source, // For debugging: 'redis' or 'postgres'
  });
});
