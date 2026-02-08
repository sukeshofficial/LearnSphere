import api from "../api/api.js";

// getLearnerStats may return 404 if the progress stats endpoint is not yet implemented on the backend.
// We must handle this gracefully in the UI.
export const getLearnerStats = () => api.get("/api/progress/users/me/stats");
export const getMyEnrollments = () => api.get("/api/users/me/enrollments");
export const purchaseCourse = (courseId, paymentData) => api.post(`/api/courses/${courseId}/purchase`, paymentData);
export const enrollInCourse = (courseId) => api.post(`/api/courses/${courseId}/enroll`, {});
