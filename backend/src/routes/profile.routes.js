import { Router } from "express";
import { deleteProfile, updateMyProfile } from "../controllers/profile.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = Router();

router.put(
  "/edit-profile",
  authMiddleware,
  upload.single("profile_photo"),
  updateMyProfile
);
router.delete("/delete-profile", authMiddleware, deleteProfile);

export default router;