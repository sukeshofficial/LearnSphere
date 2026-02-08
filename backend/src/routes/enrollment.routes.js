import { Router } from "express";
import enrollmentController from "../controllers/enrollment.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Enroll in a course (POST /api/enrollments/:id/enroll)
router.post("/:id/enroll", requireAuth, enrollmentController.enroll);

// Get my enrollments (GET /api/enrollments/my)
router.get("/my", requireAuth, enrollmentController.getMyEnrollments);

// Get my pending invites (GET /api/enrollments/my-invites)
router.get("/my-invites", requireAuth, enrollmentController.getPendingInvites);

// Invite user (POST /api/enrollments/:id/invite)
router.post("/:id/invite", requireAuth, requireRole("admin", "instructor"), enrollmentController.inviteToCourse);

export default router;
