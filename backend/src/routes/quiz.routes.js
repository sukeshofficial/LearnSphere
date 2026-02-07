import { Router } from "express";
import quizController from "../controllers/quiz.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/quizzes", requireAuth, requireRole("admin", "instructor"), quizController.createQuiz);
router.put("/quizzes/:id", requireAuth, requireRole("admin", "instructor"), quizController.updateQuiz);

// Questions
router.post("/quizzes/:quizId/questions", requireAuth, requireRole("admin", "instructor"), quizController.addQuestion);
router.put("/quizzes/questions/:id", requireAuth, requireRole("admin", "instructor"), quizController.updateQuestion);
router.delete("/quizzes/questions/:id", requireAuth, requireRole("admin", "instructor"), quizController.deleteQuestion);

// Set Rewards
router.post("/quizzes/:quizId/rewards", requireAuth, requireRole("admin", "instructor"), quizController.setRewards);

// Get Quiz Details (for taking the quiz)
router.get("/quizzes/:id", requireAuth, quizController.getQuiz);

// Submit Quiz Attempt
router.post("/quizzes/:id/submit", requireAuth, quizController.submitQuiz);

// Get Quizzes by Course
router.get("/courses/:courseId/quizzes", requireAuth, quizController.getQuizzesByCourse);

export default router;
