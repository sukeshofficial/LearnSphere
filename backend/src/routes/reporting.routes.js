import { Router } from "express";
import reportingController from "../controllers/reporting.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Instructor/Admin only: Get course-level aggregate stats
router.get("/reporting/courses/:courseId/stats", requireAuth, requireRole("admin", "instructor"), reportingController.getCourseStats);

// Instructor/Admin only: Get detailed progress for all learners in a course
router.get("/reporting/courses/:courseId/learners", requireAuth, requireRole("admin", "instructor"), reportingController.getLearnerReports);

export default router;
