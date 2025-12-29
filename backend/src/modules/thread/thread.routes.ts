import { Router } from "express";
import { isAuth } from "../../middleware/isAuth.js";
import {
  createThread,
  getThreadById,
  updateThread,
  deleteThread,
  getAllthread,
} from "./thread.controller.js";

const router = Router();

// Public
router.get("/all",getAllthread);
router.get("/:id", getThreadById);

// Authenticated
router.post("/post", isAuth, createThread);
router.patch("/:id", isAuth, updateThread);
router.delete("/:id", isAuth, deleteThread);
export default router;