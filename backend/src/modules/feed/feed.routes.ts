import { Router } from "express";
import { isAuth } from "../../middleware/isAuth.js";
import { rateLimit } from "../../redis/rateLimit.redis.js";
import { getHomeFeed, getGlobalFeed } from "./feed.controller.js";

const router = Router();

// Global feed (no auth), rate limited
router.get(
  "/global",
  rateLimit({ name: "global-feed", windowSeconds: 15, maxRequests: 60 }),
  getGlobalFeed
);

// Home feed (requires auth), tighter rate limits per user
router.get(
  "/home",
  isAuth,
  rateLimit({ name: "home-feed", windowSeconds: 10, maxRequests: 40 }),
  getHomeFeed
);

export default router;
