import { Router } from "express";
import lessonController from "../controllers/lesson.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Route with courseId in path
// Create lesson (POST /api/lessons/:courseId)
router.post("/:courseId", requireAuth, requireRole("admin", "instructor"), lessonController.createLesson);

// List lessons for course (GET /api/lessons/course/:courseId)
router.get("/course/:courseId", (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        requireAuth(req, res, () => {
            lessonController.getLessonsByCourse(req, res);
        });
    } else {
        lessonController.getLessonsByCourse(req, res);
    }
});

// Single lesson routes (GET /api/lessons/:id, etc.)
router.put("/:id", requireAuth, lessonController.updateLesson);
router.delete("/:id", requireAuth, lessonController.deleteLesson);

// Attachment routes (GET /api/lessons/:lessonId/attachments)
router.get("/:lessonId/attachments", lessonController.getAttachments);
router.post("/:lessonId/attachments", requireAuth, requireRole("admin", "instructor"), lessonController.addAttachment);
router.delete("/attachments/:id", requireAuth, lessonController.deleteAttachment);

export default router;
