import { Router } from "express";
import reportingController from "../controllers/reporting.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Instructor/Admin only: Get course-level aggregate stats (GET /api/reporting/courses/:courseId/stats)
router.get("/courses/:courseId/stats", requireAuth, requireRole("admin", "instructor"), reportingController.getCourseStats);

// Instructor/Admin only: Get detailed progress for all learners in a course (GET /api/reporting/courses/:courseId/learners)
router.get("/courses/:courseId/learners", requireAuth, requireRole("admin", "instructor"), reportingController.getLearnerReports);

// Instructor/Admin only: Global progress report for all courses owned by instructor (GET /api/reporting/course-progress)
router.get("/course-progress", requireAuth, requireRole("admin", "instructor"), reportingController.getAllLearnerProgress);

export default router;
