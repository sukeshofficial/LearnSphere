import { Router } from "express";
import reviewController from "../controllers/review.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Public: Get reviews for a course (GET /api/reviews/course/:courseId)
router.get("/course/:courseId", reviewController.getCourseReviews);

// Protected: Add a review (POST /api/reviews/course/:courseId)
router.post("/course/:courseId", requireAuth, reviewController.addReview);

// Protected: Delete a review (By owner or admin) (DELETE /api/reviews/:id)
router.delete("/:id", requireAuth, reviewController.deleteReview);

export default router;
