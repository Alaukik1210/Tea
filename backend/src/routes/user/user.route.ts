import express from "express";
import { loginUser, signupUser, verifyOtp } from "../../modules/user/user.controller.js";

const router = express.Router();

router.post("/signup",signupUser);
router.post("/verify",verifyOtp);
router.post("/login",loginUser);

export default router;