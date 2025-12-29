import tryCatch from "../../lib/TryCatch.js";
import { prisma } from "../../lib/db.js";
import { redisClient } from "../../config/redis.js";
import { BadRequestError, NotfoundError } from "../../lib/errors.js";
import { AuthenticatedRequest } from "../../middleware/isAuth.js";
import sanitizeHtml from "sanitize-html";

const THREAD_CACHE_TTL = 90; // seconds

/* -------------------------------- */
/* CREATE THREAD */
/* -------------------------------- */

export const createThread = tryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user?.id) {
      throw new BadRequestError("Not authenticated");
    }

    const { content, mediaUrl, postType } = req.body;

    if (!content || typeof content !== "string") {
      throw new BadRequestError("Content is required");
    }

    if (content.length > 1000) {
      throw new BadRequestError("Content too long");
    }

    if (postType && !["NORMAL", "DEBATABLE", "CLAIM"].includes(postType)) {
      throw new BadRequestError("Invalid post type");
    }

    const safeContent = sanitizeHtml(content, { allowedTags: [] });

    const thread = await prisma.thread.create({
      data: {
        content: safeContent,
        mediaUrl,
        postType: postType ?? "NORMAL",
        authorId: req.user.id,
      },
      select: {
        id: true,
        content: true,
        postType: true,
        mediaUrl: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // 🔁 Feed cache (if exists) should be invalidated here later

    res.status(201).json(thread);
  }
);

/* -------------------------------- */
/* GET THREAD BY ID (REDIS CACHED) */
/* -------------------------------- */

export const getThreadById = tryCatch(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError("Thread id is required");
  }

  const cacheKey = `thread:${id}`;

  // 1️⃣ Try Redis first
  const cachedThread = await redisClient.get(cacheKey);
  if (cachedThread) {
    return res.json(JSON.parse(cachedThread));
  }

  // 2️⃣ Fetch from DB
  const thread = await prisma.thread.findUnique({
    where: { id },
    select: {
      id: true,
      content: true,
      postType: true,
      mediaUrl: true,
      createdAt: true,
      updatedAt: true,

      author: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },

      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },

      comments: {
        where: { parentId: null },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  if (!thread) {
    throw new NotfoundError("Thread not found");
  }

  // 3️⃣ Store in Redis
  await redisClient.set(
    cacheKey,
    JSON.stringify(thread),
    { EX: THREAD_CACHE_TTL }
  );

  res.json(thread);
});

/* -------------------------------- */
/* UPDATE THREAD */
/* -------------------------------- */

export const updateThread = tryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user?.id) {
      throw new BadRequestError("Not authenticated");
    }

    const { id } = req.params;
    const { content, mediaUrl } = req.body;

    if (!content && mediaUrl === undefined) {
      throw new BadRequestError("Nothing to update");
    }

    const existing = await prisma.thread.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!existing) {
      throw new NotfoundError("Thread not found");
    }

    if (existing.authorId !== req.user.id) {
      throw new BadRequestError("You are not allowed to edit this thread");
    }

    const updated = await prisma.thread.update({
      where: { id },
      data: {
        content: content
          ? sanitizeHtml(content, { allowedTags: [] })
          : undefined,
        mediaUrl,
      },
      select: {
        id: true,
        content: true,
        mediaUrl: true,
        updatedAt: true,
      },
    });

    // 🔁 Invalidate cache
    await redisClient.del(`thread:${id}`);

    res.json({
      message: "Thread updated successfully",
      thread: updated,
    });
  }
);

/* -------------------------------- */
/* DELETE THREAD */
/* -------------------------------- */

export const deleteThread = tryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user?.id) {
      throw new BadRequestError("Not authenticated");
    }

    const { id } = req.params;

    const thread = await prisma.thread.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!thread) {
      throw new NotfoundError("Thread not found");
    }

    if (thread.authorId !== req.user.id) {
      throw new BadRequestError("You are not allowed to delete this thread");
    }

    await prisma.thread.delete({ where: { id } });

    // 🔁 Invalidate cache
    await redisClient.del(`thread:${id}`);

    res.json({ message: "Thread deleted successfully" });
  }
);

export const getAllthread = tryCatch(async (req, res)=>{
    const threads = await prisma.thread.findMany({

      orderBy: {
      createdAt: "desc", // ✅ latest post first
    },
        select: {
          id: true,
          content: true,
          postType: true,
          mediaUrl: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });
      res.json(threads);
})