import { Router } from "express";
import quizController from "../controllers/quiz.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", requireAuth, requireRole("admin", "instructor"), quizController.createQuiz);
router.put("/:id", requireAuth, requireRole("admin", "instructor"), quizController.updateQuiz);

// Questions
router.post("/:quizId/questions", requireAuth, requireRole("admin", "instructor"), quizController.addQuestion);
router.put("/questions/:id", requireAuth, requireRole("admin", "instructor"), quizController.updateQuestion);
router.delete("/questions/:id", requireAuth, requireRole("admin", "instructor"), quizController.deleteQuestion);

// Set Rewards
// Set Rewards
router.post("/:quizId/rewards", requireAuth, requireRole("admin", "instructor"), quizController.setRewards);

// Get Quiz Details (for taking the quiz)
// Get Quiz Details (for taking the quiz)
router.get("/:id", requireAuth, quizController.getQuiz);

// Submit Quiz Attempt
router.post("/:id/submit", requireAuth, quizController.submitQuiz);

// Get Quizzes by Course (GET /api/quizzes/course/:courseId)
router.get("/course/:courseId", requireAuth, quizController.getQuizzesByCourse);

export default router;
