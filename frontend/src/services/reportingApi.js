import api from "../api/api";

/**
 * Fetch global learner progress for all courses owned by the instructor
 * Returns: Array of { course_name, participant_name, enrolled_date, start_date, time_spent_seconds, completion_percentage, completed_date, status }
 */
export const getCourseProgressReport = () => api.get("/api/reporting/course-progress");

/**
 * Fetch overview stats for a specific course
 */
export const getCourseStats = (courseId) => api.get(`/api/reporting/courses/${courseId}/stats`);

/**
 * Fetch detailed learner reports for a specific course
 */
export const getLearnerReports = (courseId) => api.get(`/api/reporting/courses/${courseId}/learners`);