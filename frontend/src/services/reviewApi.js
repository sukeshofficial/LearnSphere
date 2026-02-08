import api from "../api/api";

export const getReviews = (courseId) => api.get(`/api/reviews/course/${courseId}`);

export const addReview = (courseId, data) => api.post(`/api/reviews/course/${courseId}`, data);

export const deleteReview = (reviewId) => api.delete(`/api/reviews/${reviewId}`);
