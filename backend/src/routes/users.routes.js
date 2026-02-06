import { Router } from "express";
import {
  getPublicProfile,
  searchUsers,
} from "../controllers/users.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.get("/search", searchUsers);
router.get("/:username", authMiddleware, getPublicProfile);

export default router;