import api from "../api/api";

export const getLessonsByCourse = (courseId) => api.get(`/api/lessons/course/${courseId}`);

export const createLesson = (data) => api.post("/api/lessons", data);

export const updateLesson = (id, data) => api.put(`/api/lessons/${id}`, data);

export const deleteLesson = (id) => api.delete(`/api/lessons/${id}`);
