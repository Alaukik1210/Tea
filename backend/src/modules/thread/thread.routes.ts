import { Router } from "express";
import { isAuth } from "../../middleware/isAuth.js";
import {
  createThread,
  getThreadById,
  updateThread,
  deleteThread,
} from "./thread.controller.js";

const router = Router();

// Public
router.get("/:id", getThreadById);

// Authenticated
router.post("/", isAuth, createThread);
router.patch("/:id", isAuth, updateThread);
router.delete("/:id", isAuth, deleteThread);

export default router;