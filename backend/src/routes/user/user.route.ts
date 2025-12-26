import express from "express";
import { signupUser, verifyOtp } from "../../modules/user/user.controller.js";

const router = express.Router();

router.post("/signup",signupUser);
router.post("/verify",verifyOtp);

export default router;