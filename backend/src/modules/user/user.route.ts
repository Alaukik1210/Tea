import express from "express";
import { followUser, getAllUsers, getFollowers, getFollowing, loginUser, logout, myProfile, searchUsers, signupUser, unfollowUser, updateUser, verifyOtp } from "./user.controller.js";
import { isAuth } from "../../middleware/isAuth.js";

const router = express.Router();

router.post("/signup",signupUser);
router.post("/verify",verifyOtp);
router.post("/login",loginUser);
router.get("/me",isAuth,myProfile);
router.patch("/update",isAuth,updateUser);
router.post("/logout",isAuth,logout);
router.get("/all",  getAllUsers);
router.get("/search",  searchUsers);

router.post("/:id/follow", isAuth, followUser);
router.delete("/:id/follow", isAuth, unfollowUser);
router.get("/:id/followers", getFollowers);
router.get("/:id/following", getFollowing);


export default router;