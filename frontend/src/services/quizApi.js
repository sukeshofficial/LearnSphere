import api from "../api/api";

export const getQuizzesByCourse = (courseId) => api.get(`/api/quizzes/course/${courseId}`);
export const createQuiz = (courseId, title) => api.post("/api/quizzes", { courseId, title });
export const updateQuiz = (quizId, title) => api.put(`/api/quizzes/${quizId}`, { title });
export const getQuizFull = (quizId) => api.get(`/api/quizzes/${quizId}`);

// Questions
export const addQuestion = (quizId, questionData) => api.post(`/api/quizzes/${quizId}/questions`, questionData);
export const updateQuestion = (questionId, questionData) => api.put(`/api/quizzes/questions/${questionId}`, questionData);
export const deleteQuestion = (questionId) => api.delete(`/api/quizzes/questions/${questionId}`);

// Rewards
export const setRewards = (quizId, rewards) => api.post(`/api/quizzes/${quizId}/rewards`, rewards);

// Participation
export const submitQuiz = (quizId, answers) => api.post(`/api/quizzes/${quizId}/submit`, { answers });
