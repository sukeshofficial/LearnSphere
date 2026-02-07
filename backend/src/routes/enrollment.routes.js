import { Router } from "express";
import enrollmentController from "../controllers/enrollment.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Enroll in a course
router.post("/courses/:id/enroll", requireAuth, enrollmentController.enroll);

// Get my enrollments
router.get("/users/me/enrollments", requireAuth, enrollmentController.getMyEnrollments);

// Get my pending invites
router.get("/users/me/invites", requireAuth, enrollmentController.getPendingInvites);

// Invite user (Instructor/Admin only)
router.post("/courses/:id/invite", requireAuth, requireRole("admin", "instructor"), enrollmentController.inviteToCourse);

export default router;
