import lessonService from "../services/lesson.service.js";

class LessonController {
    createLesson = async (req, res) => {
        try {
            const { courseId } = req.params;
            const validation = lessonService.validateLesson(req.body);
            if (!validation.valid) {
                return res.status(400).json({ error: validation.errors[0] });
            }

            const course = await lessonService.getCourseForOwnershipCheck(courseId);
            if (!course) {
                return res.status(404).json({ error: "Course not found" });
            }

            // Authorization check
            const isOwner = course.created_by === req.user.id;
            const isAdmin = (req.user.role || "").toLowerCase() === "admin" || req.user.is_super_admin;

            if (!isOwner && !isAdmin) {
                return res.status(403).json({ error: "Not authorized to add lessons to this course" });
            }

            const lesson = await lessonService.createLesson(courseId, req.body, req.user.id);
            return res.status(201).json(lesson);
        } catch (error) {
            console.error("Create Lesson Error:", error);
            return res.status(500).json({ error: "Failed to create lesson" });
        }
    };

    updateLesson = async (req, res) => {
        try {
            const { id } = req.params;
            const lesson = await lessonService.getLessonById(id);
            if (!lesson) {
                return res.status(404).json({ error: "Lesson not found" });
            }

            const course = await lessonService.getCourseForOwnershipCheck(lesson.course_id);

            const isOwner = course.created_by === req.user.id;
            const isAdmin = (req.user.role || "").toLowerCase() === "admin" || req.user.is_super_admin;

            if (!isOwner && !isAdmin) {
                return res.status(403).json({ error: "Not authorized to update this lesson" });
            }

            const validation = lessonService.validateLesson(req.body);
            if (!validation.valid) {
                return res.status(400).json({ error: validation.errors[0] });
            }

            const updatedLesson = await lessonService.updateLesson(id, req.body);
            return res.status(200).json(updatedLesson);
        } catch (error) {
            console.error("Update Lesson Error:", error);
            return res.status(500).json({ error: "Failed to update lesson" });
        }
    };

    deleteLesson = async (req, res) => {
        try {
            const { id } = req.params;
            const lesson = await lessonService.getLessonById(id);
            if (!lesson) {
                return res.status(404).json({ error: "Lesson not found" });
            }

            const course = await lessonService.getCourseForOwnershipCheck(lesson.course_id);

            const isOwner = course.created_by === req.user.id;
            const isAdmin = (req.user.role || "").toLowerCase() === "admin" || req.user.is_super_admin;

            if (!isOwner && !isAdmin) {
                return res.status(403).json({ error: "Not authorized to delete this lesson" });
            }

            await lessonService.deleteLesson(id);
            return res.status(204).send();
        } catch (error) {
            console.error("Delete Lesson Error:", error);
            return res.status(500).json({ error: "Failed to delete lesson" });
        }
    };

    getLessonsByCourse = async (req, res) => {
        try {
            const { courseId } = req.params;
            const course = await lessonService.getCourseForOwnershipCheck(courseId);
            if (!course) {
                return res.status(404).json({ error: "Course not found" });
            }

            // Visibility logic
            const isOwner = course.created_by === req.user.id;
            const isAdmin = (req.user.role || "").toLowerCase() === "admin" || req.user.is_super_admin;

            if (!course.is_published && !isOwner && !isAdmin) {
                return res.status(403).json({ error: "Course is not published" });
            }

            if (course.visibility === "SIGNED_IN" && !req.user.id) {
                return res.status(401).json({ error: "Authentication required to view lessons" });
            }

            const lessons = await lessonService.getLessonsByCourse(courseId);
            return res.status(200).json({ lessons });
        } catch (error) {
            console.error("Get Lessons Error:", error);
            return res.status(500).json({ error: "Failed to fetch lessons" });
        }
    };
}

export default new LessonController();
