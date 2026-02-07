import { Router } from "express";
import reviewController from "../controllers/review.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Public: Get reviews for a course
router.get("/courses/:courseId/reviews", reviewController.getCourseReviews);

// Protected: Add a review
router.post("/courses/:courseId/reviews", requireAuth, reviewController.addReview);

// Protected: Delete a review (By owner or admin)
router.delete("/reviews/:id", requireAuth, reviewController.deleteReview);

export default router;
