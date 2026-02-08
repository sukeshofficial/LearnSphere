import api from "../api/api.js";

export const getLearnerStats = () => api.get("/api/progress/users/me/stats");
export const getMyEnrollments = () => api.get("/api/enrollments/my");
export const purchaseCourse = (courseId, paymentData) => api.post(`/api/courses/${courseId}/purchase`, paymentData);
export const enrollInCourse = (courseId) => api.post(`/api/enrollments/${courseId}/enroll`, {});
