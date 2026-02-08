import api from "../api/api";

export const getCourses = (params) => api.get("/api/courses", { params });

export const getCourseById = (id) => api.get(`/api/courses/${id}`);

export const createCourse = (data) => api.post("/api/courses", data);

export const updateCourse = (id, data) => api.put(`/api/courses/${id}`, data);

export const publishCourse = (id, is_published) => api.patch(`/api/courses/${id}/publish`, { is_published });

export const deleteCourse = (id) => api.delete(`/api/courses/${id}`);

export const getLessonsByCourse = (courseId) => api.get(`/api/lessons/course/${courseId}`);
