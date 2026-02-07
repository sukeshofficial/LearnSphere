import api from "../api/api";

export const getLessonsByCourse = (courseId) => api.get(`/api/courses/${courseId}/lessons`);

export const createLesson = (courseId, data) => api.post(`/api/courses/${courseId}/lessons`, data);

export const updateLesson = (id, data) => api.put(`/api/lessons/${id}`, data);

export const deleteLesson = (id) => api.delete(`/api/lessons/${id}`);

export const addAttachment = (lessonId, data) => api.post(`/api/lessons/${lessonId}/attachments`, data);

export const deleteAttachment = (id) => api.delete(`/api/attachments/${id}`);
