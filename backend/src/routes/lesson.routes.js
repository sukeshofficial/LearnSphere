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

// Attachment routes
router.get("/lessons/:lessonId/attachments", (req, res, next) => {
    // Public view if course is public, handled in service/controller
    lessonController.getAttachments(req, res);
});
router.post("/lessons/:lessonId/attachments", requireAuth, requireRole("admin", "instructor"), lessonController.addAttachment);
router.delete("/attachments/:id", requireAuth, lessonController.deleteAttachment);

export default router;
