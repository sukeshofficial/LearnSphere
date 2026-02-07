import reportingService from "../services/reporting.service.js";

class ReportingController {
    getCourseStats = async (req, res) => {
        try {
            const { courseId } = req.params;
            const stats = await reportingService.getCourseCompletionStats(courseId);
            return res.status(200).json(stats);
        } catch (error) {
            console.error("Get Course Stats Error:", error);
            return res.status(500).json({ error: "Failed to fetch reporting stats" });
        }
    };

    getLearnerReports = async (req, res) => {
        try {
            const { courseId } = req.params;
            const reports = await reportingService.getDetailedLearnerProgress(courseId);
            return res.status(200).json(reports);
        } catch (error) {
            console.error("Get Learner Reports Error:", error);
            return res.status(500).json({ error: "Failed to fetch learner reports" });
        }
    };
}

export default new ReportingController();
