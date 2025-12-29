import { prisma } from "../../lib/db.js";
import { redisClient } from "../../config/redis.js";

const GLOBAL_FEED_KEY = "global:feed";
const MAX_FEED_SIZE = 200;
const THREAD_CACHE_PREFIX = "thread:";
const THREAD_CACHE_TTL = 600; // 10 minutes

/**
 * Preload global feed from PostgreSQL to Redis on startup
 */
export async function preloadGlobalFeed(): Promise<void> {
  try {
    console.log(" Checking global feed cache...");
    
    const exists = await redisClient.exists(GLOBAL_FEED_KEY);
    if (exists) {
      console.log(" Global feed already in Redis");
      return;
    }

    console.log(" Preloading global feed from PostgreSQL...");
    
    const threads = await prisma.thread.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: MAX_FEED_SIZE,
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
      },
    });

    if (threads.length === 0) {
      console.log(" No threads found to preload");
      return;
    }

    // Use pipeline for atomic operations
    const pipeline = redisClient.multi();

    for (const thread of threads) {
      // Add thread ID to global feed list
      pipeline.lPush(GLOBAL_FEED_KEY, thread.id);

      // Cache thread data
      const threadData = {
        id: thread.id,
        content: thread.content,
        postType: thread.postType,
        mediaUrl: thread.mediaUrl ?? null,
        createdAt: thread.createdAt.toISOString(),
        author: thread.author,
        stats: {
          likes: thread._count.likes,
          comments: thread._count.comments,
        },
      };

      pipeline.set(
        `${THREAD_CACHE_PREFIX}${thread.id}`,
        JSON.stringify(threadData),
        { EX: THREAD_CACHE_TTL }
      );
    }

    await pipeline.exec();

    console.log(` Preloaded ${threads.length} threads to global feed`);
  } catch (error) {
    console.error("Failed to preload global feed:", error);
    // Don't crash the server, just log the error
  }
}

/**
 * Add a new thread to the global feed (called on create)
 */
export async function addThreadToGlobalFeed(
  threadId: string,
  threadData: any
): Promise<void> {
  try {
    const pipeline = redisClient.multi();

    // Add to front of list
    pipeline.lPush(GLOBAL_FEED_KEY, threadId);

    // Trim to keep only latest MAX_FEED_SIZE items
    pipeline.lTrim(GLOBAL_FEED_KEY, 0, MAX_FEED_SIZE - 1);

    // Cache thread data
    pipeline.set(
      `${THREAD_CACHE_PREFIX}${threadId}`,
      JSON.stringify(threadData),
      { EX: THREAD_CACHE_TTL }
    );

    await pipeline.exec();
  } catch (error) {
    console.error("Failed to add thread to global feed:", error);
    // Fail silently, PostgreSQL remains source of truth
  }
}

/**
 * Remove a thread from the global feed (called on delete)
 */
export async function removeThreadFromGlobalFeed(
  threadId: string
): Promise<void> {
  try {
    const pipeline = redisClient.multi();

    // Remove from list (removes all occurrences)
    pipeline.lRem(GLOBAL_FEED_KEY, 0, threadId);

    // Delete cached thread data
    pipeline.del(`${THREAD_CACHE_PREFIX}${threadId}`);

    await pipeline.exec();
  } catch (error) {
    console.error(" Failed to remove thread from global feed:", error);
  }
}

/**
 * Update thread data in cache (called on edit)
 */
export async function updateThreadInCache(
  threadId: string,
  threadData: any
): Promise<void> {
  try {
    // Update cached data with new TTL
    await redisClient.set(
      `${THREAD_CACHE_PREFIX}${threadId}`,
      JSON.stringify(threadData),
      { EX: THREAD_CACHE_TTL }
    );
  } catch (error) {
    console.error(" Failed to update thread in cache:", error);
  }
}

/**
 * Get global feed from Redis with pagination
 * Falls back to PostgreSQL if Redis doesn't have enough data
 */
export async function getGlobalFeedFromRedis(
  page: number = 1,
  limit: number = 20
): Promise<{ items: any[]; nextPage: number | null; source: string }> {
  try {
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // Get thread IDs from Redis list
    const threadIds = await redisClient.lRange(GLOBAL_FEED_KEY, start, end);

    if (threadIds.length === 0) {
      // Fallback to PostgreSQL
      return await getFeedFromPostgres(page, limit);
    }

    // Get thread data from cache
    const pipeline = redisClient.multi();
    for (const id of threadIds) {
      pipeline.get(`${THREAD_CACHE_PREFIX}${id}`);
    }

    const results = await pipeline.exec();
    const items: any[] = [];
    const missingIds: string[] = [];

    // Parse results and track missing items
    threadIds.forEach((id, index) => {
      const result = results?.[index] as any;
      if (result && result[1]) {
        try {
          items.push(JSON.parse(result[1] as string));
        } catch {
          missingIds.push(id);
        }
      } else {
        missingIds.push(id);
      }
    });

    // Fetch missing items from PostgreSQL
    if (missingIds.length > 0) {
      const missingThreads = await prisma.thread.findMany({
        where: { id: { in: missingIds } },
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
        },
      });

      // Add to items and cache them
      for (const thread of missingThreads) {
        const threadData = {
          id: thread.id,
          content: thread.content,
          postType: thread.postType,
          mediaUrl: thread.mediaUrl ?? null,
          createdAt: thread.createdAt.toISOString(),
          author: thread.author,
          stats: {
            likes: thread._count.likes,
            comments: thread._count.comments,
          },
        };

        items.push(threadData);

        // Cache for future requests
        redisClient.set(
          `${THREAD_CACHE_PREFIX}${thread.id}`,
          JSON.stringify(threadData),
          { EX: THREAD_CACHE_TTL }
        );
      }
    }

    // Sort items by their original order in threadIds
    const orderedItems = threadIds
      .map((id) => items.find((item) => item.id === id))
      .filter(Boolean);

    // Check if there are more items
    const totalInRedis = await redisClient.lLen(GLOBAL_FEED_KEY);
    const hasMore = end + 1 < totalInRedis;

    return {
      items: orderedItems,
      nextPage: hasMore ? page + 1 : null,
      source: "redis",
    };
  } catch (error) {
    console.error(" Failed to get feed from Redis, falling back to PostgreSQL:", error);
    return await getFeedFromPostgres(page, limit);
  }
}

/**
 * Fallback: Get feed from PostgreSQL
 */
async function getFeedFromPostgres(
  page: number,
  limit: number
): Promise<{ items: any[]; nextPage: number | null; source: string }> {
  const skip = (page - 1) * limit;

  const threads = await prisma.thread.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip,
    take: limit + 1, // Fetch one extra to check if there are more
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
    },
  });

  const hasMore = threads.length > limit;
  const items = threads.slice(0, limit).map((t) => ({
    id: t.id,
    content: t.content,
    postType: t.postType,
    mediaUrl: t.mediaUrl ?? null,
    createdAt: t.createdAt.toISOString(),
    author: t.author,
    stats: {
      likes: t._count.likes,
      comments: t._count.comments,
    },
  }));

  return {
    items,
    nextPage: hasMore ? page + 1 : null,
    source: "postgres",
  };
}
