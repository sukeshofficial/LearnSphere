import progressService from "../services/progress.service.js";

class ProgressController {
    trackLesson = async (req, res) => {
        try {
            const { lessonId } = req.params;
            const { courseId, completed, time_spent } = req.body;
            const userId = req.user.id;

            if (!courseId) return res.status(400).json({ error: "courseId is required" });

            const progress = await progressService.updateLessonProgress(userId, lessonId, courseId, completed, time_spent || 0);
            return res.status(200).json(progress);
        } catch (error) {
            console.error("Track Lesson Error:", error);
            return res.status(500).json({ error: "Failed to update progress" });
        }
    };

    getCourseStatus = async (req, res) => {
        try {
            const { courseId } = req.params;
            const userId = req.user.id;

            const progress = await progressService.getCourseProgress(userId, courseId);
            return res.status(200).json(progress);
        } catch (error) {
            console.error("Get Course Status Error:", error);
            return res.status(500).json({ error: "Failed to fetch progress" });
        }
    };

    getMyStats = async (req, res) => {
        try {
            const stats = await progressService.getLearnerStats(req.user.id);
            return res.status(200).json(stats);
        } catch (error) {
            console.error("Get My Stats Error:", error);
            return res.status(500).json({ error: "Failed to fetch stats" });
        }
    }
}

export default new ProgressController();
