import { Router } from "express";
import quizController from "../controllers/quiz.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Create Quiz (Instructor/Admin)
router.post("/quizzes", requireAuth, requireRole("admin", "instructor"), quizController.createQuiz);

// Add Question with Options
router.post("/quizzes/:quizId/questions", requireAuth, requireRole("admin", "instructor"), quizController.addQuestion);

// Set Rewards
router.post("/quizzes/:quizId/rewards", requireAuth, requireRole("admin", "instructor"), quizController.setRewards);

// Get Quiz Details (for taking the quiz)
router.get("/quizzes/:id", requireAuth, quizController.getQuiz);

// Submit Quiz Attempt
router.post("/quizzes/:id/submit", requireAuth, quizController.submitQuiz);

export default router;
