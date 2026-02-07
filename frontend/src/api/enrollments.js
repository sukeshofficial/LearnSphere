import api from "./api";

export const enrollInCourse = (courseId, inviteToken) =>
    api.post(`/api/courses/${courseId}/enroll`, {
        invite_token: inviteToken,
    });
