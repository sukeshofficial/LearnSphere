import { Router } from "express";
import courseController from "../controllers/course.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes (with optional auth for visibility checks)
router.get("/", (req, res, next) => {
    // Try to authenticate but don't fail if no token
    // This allows the controller to know if it's a signed-in user or not
    const token = req.cookies.token;
    if (token) {
        requireAuth(req, res, () => {
            courseController.getAllCourses(req, res);
        });
    } else {
        courseController.getAllCourses(req, res);
    }
});

router.get("/:id", (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        requireAuth(req, res, () => {
            courseController.getCourseById(req, res);
        });
    } else {
        courseController.getCourseById(req, res);
    }
});

// Protected routes
router.post("/", requireAuth, requireRole("admin", "instructor"), courseController.createCourse);
router.put("/:id", requireAuth, courseController.updateCourse);
router.patch("/:id/publish", requireAuth, courseController.publishCourse);
router.delete("/:id", requireAuth, courseController.deleteCourse);

export default router;
