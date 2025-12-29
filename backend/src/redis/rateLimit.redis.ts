import { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import { redisClient } from "../config/redis.js";

/**
 * Simple Redis-based rate limiter middleware.
 * Keys by user id when available, otherwise by IP.
 */
export function rateLimit({
	windowSeconds = 15,
	maxRequests = 60,
	name = "default",
}: {
	windowSeconds?: number;
	maxRequests?: number;
	name?: string;
}) {
	return async function (
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			const keyBase = req.user?.id ?? req.ip ?? "anonymous";
			const windowStart = Math.floor(Date.now() / 1000 / windowSeconds);
			const key = `rl:${name}:${keyBase}:${windowStart}`;

			const count = await redisClient.incr(key);
			if (count === 1) {
				await redisClient.expire(key, windowSeconds);
			}

			if (count > maxRequests) {
				return res.status(429).json({
					message: "Too many requests. Please slow down.",
				});
			}

			next();
		} catch (err) {
			// Fail-open: don't block if Redis temporarily fails
			next();
		}
	};
}

