import api from "./api";

export const registerUser = (data) => api.post("/api/auth/register", data);
export const loginUser = (data) => api.post("/api/auth/login", data);
export const logoutUser = () => api.post("/api/auth/logout");
export const me = () => api.get("/api/auth/me");
export const getUserPoints = () => api.get("/api/auth/me/points");
export const verifySignupOtp = (data) =>  api.post("/api/auth/verify-signup-otp", data);
export const resendSignupOtp = (data) =>  api.post("/api/auth/resend-signup-otp", data);