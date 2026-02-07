import { Router } from "express";
import lessonController from "../controllers/lesson.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Route with courseId in path
router.post("/courses/:courseId/lessons", requireAuth, requireRole("admin", "instructor"), lessonController.createLesson);

// Visibility respects course rules
router.get("/courses/:courseId/lessons", (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        requireAuth(req, res, () => {
            lessonController.getLessonsByCourse(req, res);
        });
    } else {
        lessonController.getLessonsByCourse(req, res);
    }
});

// Single lesson routes
router.put("/lessons/:id", requireAuth, lessonController.updateLesson);
router.delete("/lessons/:id", requireAuth, lessonController.deleteLesson);

export default router;
