import { Router } from "express";
import upload from "../middleware/upload.middleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  verifySignupOtp,
  resendSignupOtp
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", upload.single("profilePhoto"), registerUser);
router.post("/verify-signup-otp", verifySignupOtp);
router.post("/resend-signup-otp", resendSignupOtp); // optional
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;