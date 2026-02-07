import enrollmentService from "../services/enrollment.service.js";

class EnrollmentController {
    enroll = async (req, res) => {
        try {
            const { id: courseId } = req.params;
            const { invite_token, payment_txn_id } = req.body || {};
            const userId = req.user.id;

            const course = await enrollmentService.getCourseById(courseId);
            if (!course) {
                return res.status(404).json({ error: "Course not found" });
            }

            if (!course.is_published) {
                return res.status(403).json({ error: "Cannot enroll in an unpublished course" });
            }

            // Check if already enrolled and active
            const existing = await enrollmentService.getEnrollment(userId, courseId);
            if (existing && existing.status === 'ACTIVE') {
                return res.status(200).json({ enrollment: existing });
            }

            let enrollment;

            if (course.access_rule === 'OPEN') {
                enrollment = await enrollmentService.createDirectEnrollment(userId, courseId);
            }
            else if (course.access_rule === 'INVITE') {
                // If user is already invited, we can auto-enroll them even without explicit token
                if (existing && existing.status === 'INVITED') {
                    enrollment = await enrollmentService.createDirectEnrollment(userId, courseId, 'ACTIVE');
                } else if (invite_token) {
                    const result = await enrollmentService.enrollWithToken(userId, courseId, invite_token);
                    if (result.error) {
                        return res.status(400).json({ error: "Invalid or expired invite token" });
                    }
                    enrollment = result;
                } else {
                    return res.status(400).json({ error: "Invite token is required for this course" });
                }
            }
            else if (course.access_rule === 'PAID') {
                if (!payment_txn_id || payment_txn_id.length < 5) {
                    return res.status(400).json({ error: "Valid payment transaction ID is required" });
                }
                enrollment = await enrollmentService.enrollWithPayment(userId, courseId, payment_txn_id);
            }

            return res.status(201).json({ enrollment });
        } catch (error) {
            console.error("Enrollment Error:", error);
            return res.status(500).json({ error: "Internal server error during enrollment" });
        }
    };

    getMyEnrollments = async (req, res) => {
        try {
            const enrollments = await enrollmentService.getUserEnrollments(req.user.id);
            return res.status(200).json({ enrollments });
        } catch (error) {
            console.error("Get Enrollments Error:", error);
            return res.status(500).json({ error: "Failed to fetch enrollments" });
        }
    };

    getPendingInvites = async (req, res) => {
        try {
            const invites = await enrollmentService.getPendingInvites(req.user.id);
            return res.status(200).json({ invites });
        } catch (error) {
            console.error("Get Invites Error:", error);
            return res.status(500).json({ error: "Failed to fetch pending invites" });
        }
    };

    inviteToCourse = async (req, res) => {
        try {
            const { id: courseId } = req.params;
            const { email } = req.body;

            if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
                return res.status(400).json({ error: "Valid email is required" });
            }

            const isAuthorized = await enrollmentService.isCourseOwnerOrAdmin(
                courseId,
                req.user.id,
                req.user.role,
                req.user.is_super_admin
            );

            if (!isAuthorized) {
                return res.status(403).json({ error: "Not authorized to invite users to this course" });
            }

            const userToInvite = await enrollmentService.getUserByEmail(email);
            if (!userToInvite) {
                return res.status(404).json({ error: "User not found with this email" });
            }

            await enrollmentService.createInvite(courseId, userToInvite.id, req.user.id);

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error("Invite Error:", error);
            return res.status(500).json({ error: "Failed to create invitation" });
        }
    };
}

export default new EnrollmentController();
