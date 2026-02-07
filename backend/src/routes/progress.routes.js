import { Router } from "express";
import progressController from "../controllers/progress.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Track lesson completion
router.post("/lessons/:lessonId/progress", requireAuth, progressController.trackLesson);

// Get course progress for current user
router.get("/courses/:courseId/my-progress", requireAuth, progressController.getCourseStatus);

// Get overall learner stats
router.get("/users/me/stats", requireAuth, progressController.getMyStats);

export default router;
