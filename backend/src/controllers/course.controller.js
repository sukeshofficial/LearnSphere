import courseService from "../services/course.service.js";
import { validateCourseInput } from "../utils/course.validation.js";

class CourseController {
    createCourse = async (req, res) => {
        try {
            const { valid, errors } = validateCourseInput(req.body);
            if (!valid) {
                return res.status(400).json({ error: errors[0] });
            }

            const courseData = {
                ...req.body,
                created_by: req.userId
            };

            const course = await courseService.createCourse(courseData);
            return res.status(201).json(course);
        } catch (error) {
            console.error("Create Course Error:", error);
            return res.status(500).json({ error: "Failed to create course" });
        }
    };

    getAllCourses = async (req, res) => {
        try {
            const filters = {
                q: req.query.q,
                tags: req.query.tags,
                page: req.query.page,
                limit: req.query.limit,
                userId: req.userId
            };

            const result = await courseService.getAllCourses(filters);
            return res.status(200).json(result);
        } catch (error) {
            console.error("Get Courses Error:", error);
            return res.status(500).json({ error: "Failed to fetch courses" });
        }
    };

    getCourseById = async (req, res) => {
        try {
            const { id } = req.params;
            const result = await courseService.getCourseById(id, req.userId);

            if (!result) {
                return res.status(404).json({ error: "Course not found" });
            }

            if (result.error === "AUTHENTICATION_REQUIRED") {
                return res.status(401).json({ error: "Authentication required to view this course" });
            }

            return res.status(200).json(result);
        } catch (error) {
            console.error("Get Course Error:", error);
            return res.status(500).json({ error: "Failed to fetch course details" });
        }
    };

    updateCourse = async (req, res) => {
        try {
            const { id } = req.params;
            const course = await courseService.getRawCourse(id);

            if (!course) {
                return res.status(404).json({ error: "Course not found" });
            }

            // Authorization: Owner or Admin/SuperAdmin
            const isOwner = course.created_by === req.userId;
            const isAdmin = (req.user.role || "").toLowerCase() === "admin" || req.user.is_super_admin;

            if (!isOwner && !isAdmin) {
                return res.status(403).json({ error: "Not authorized to update this course" });
            }

            const { valid, errors } = validateCourseInput(req.body);
            if (!valid) {
                return res.status(400).json({ error: errors[0] });
            }

            const updatedCourse = await courseService.updateCourse(id, req.body);
            return res.status(200).json({ success: true, course: updatedCourse });
        } catch (error) {
            console.error("Update Course Error:", error);
            return res.status(500).json({ error: "Failed to update course" });
        }
    };

    publishCourse = async (req, res) => {
        try {
            const { id } = req.params;
            const is_published = req.body?.is_published;

            if (typeof is_published !== "boolean") {
                return res.status(400).json({ error: "is_published must be a boolean" });
            }

            const course = await courseService.getRawCourse(id);
            if (!course) {
                return res.status(404).json({ error: "Course not found" });
            }

            const isOwner = course.created_by === req.userId;
            const isAdmin = (req.user.role || "").toLowerCase() === "admin" || req.user.is_super_admin;

            if (!isOwner && !isAdmin) {
                return res.status(403).json({ error: "Not authorized to publish this course" });
            }

            const result = await courseService.setPublishStatus(id, is_published);
            return res.status(200).json(result);
        } catch (error) {
            console.error("Publish Course Error:", error);
            return res.status(500).json({ error: "Failed to update publish status" });
        }
    };

    deleteCourse = async (req, res) => {
        try {
            const { id } = req.params;
            const course = await courseService.getRawCourse(id);

            if (!course) {
                return res.status(404).json({ error: "Course not found" });
            }

            const isOwner = course.created_by === req.userId;
            const isAdmin = (req.user.role || "").toLowerCase() === "admin" || req.user.is_super_admin;

            if (!isOwner && !isAdmin) {
                return res.status(403).json({ error: "Not authorized to delete this course" });
            }

            await courseService.deleteCourse(id);
            return res.status(204).send();
        } catch (error) {
            console.error("Delete Course Error:", error);
            return res.status(500).json({ error: "Failed to delete course" });
        }
    };

    updateImage = async (req, res) => {
        try {
            const { id } = req.params;
            const { image_url } = req.body;
            if (!image_url) return res.status(400).json({ error: "image_url is required" });

            const result = await courseService.updateCourseImage(id, image_url);
            return res.status(200).json(result);
        } catch (error) {
            console.error("Update Image Error:", error);
            return res.status(500).json({ error: "Failed to update course image" });
        }
    };

    contactAttendees = async (req, res) => {
        try {
            const { id } = req.params;
            const { subject, message } = req.body;
            if (!subject || !message) return res.status(400).json({ error: "Subject and message are required" });

            const result = await courseService.contactAttendees(id, req.userId, subject, message);
            return res.status(200).json(result);
        } catch (error) {
            console.error("Contact Attendees Error:", error);
            return res.status(500).json({ error: "Failed to contact attendees" });
        }
    };

    purchaseCourse = async (req, res) => {
        try {
            const { id } = req.params;
            const result = await courseService.purchaseCourse(id, req.userId, req.body);

            // Auto-enroll after purchase
            await enrollmentService.enrollWithPayment(req.userId, id, result.txnId);

            return res.status(200).json(result);
        } catch (error) {
            console.error("Purchase Course Error:", error);
            return res.status(500).json({ error: "Failed to process purchase" });
        }
    };
}

export default new CourseController();
