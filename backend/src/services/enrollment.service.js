import pool from "../config/db.js";
import crypto from "crypto";

class EnrollmentService {
    async getCourseById(id) {
        const { rows } = await pool.query(
            "SELECT id, title, created_by, access_rule, visibility, is_published, price_cents FROM courses WHERE id = $1",
            [id]
        );
        return rows[0];
    }

    async getEnrollment(userId, courseId) {
        const { rows } = await pool.query(
            "SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2",
            [userId, courseId]
        );
        return rows[0];
    }

    async createDirectEnrollment(userId, courseId, status = 'ACTIVE') {
        const query = `
      INSERT INTO enrollments (user_id, course_id, status, enrolled_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id, course_id) DO UPDATE 
      SET status = EXCLUDED.status, enrolled_at = NOW()
      RETURNING *;
    `;
        const { rows } = await pool.query(query, [userId, courseId, status]);
        return rows[0];
    }

    async enrollWithToken(userId, courseId, inviteToken) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Verify token
            const tokenCheck = await client.query(
                "SELECT id FROM enrollments WHERE course_id = $1 AND user_id = $2 AND invite_token = $3 AND status = 'INVITED'",
                [courseId, userId, inviteToken]
            );

            if (tokenCheck.rows.length === 0) {
                await client.query("ROLLBACK");
                return { error: "INVALID_TOKEN" };
            }

            const updateQuery = `
        UPDATE enrollments
        SET status = 'ACTIVE', enrolled_at = NOW()
        WHERE course_id = $1 AND user_id = $2
        RETURNING *;
      `;
            const { rows } = await client.query(updateQuery, [courseId, userId]);

            await client.query("COMMIT");
            return rows[0];
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async enrollWithPayment(userId, courseId, paymentTxnId) {
        const query = `
      INSERT INTO enrollments (user_id, course_id, status, payment_txn_id, enrolled_at)
      VALUES ($1, $2, 'ACTIVE', $3, NOW())
      ON CONFLICT (user_id, course_id) DO UPDATE 
      SET status = 'ACTIVE', payment_txn_id = EXCLUDED.payment_txn_id, enrolled_at = NOW()
      RETURNING *;
    `;
        const { rows } = await pool.query(query, [userId, courseId, paymentTxnId]);
        return rows[0];
    }

    async getUserEnrollments(userId) {
        const query = `
      SELECT 
        e.id, 
        e.course_id, 
        c.title as course_title, 
        e.status, 
        e.enrolled_at,
        u.name as invited_by_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON e.invited_by = u.id
      WHERE e.user_id = $1
      ORDER BY e.enrolled_at DESC NULLS FIRST;
    `;
        const { rows } = await pool.query(query, [userId]);
        return rows;
    }

    async getPendingInvites(userId) {
        const query = `
      SELECT 
        e.id, 
        e.course_id, 
        c.title as course_title, 
        e.status, 
        u.name as invited_by_name,
        e.invited_by,
        e.invite_token
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON e.invited_by = u.id
      WHERE e.user_id = $1 AND e.status = 'INVITED'
      ORDER BY e.id DESC;
    `;
        const { rows } = await pool.query(query, [userId]);
        return rows;
    }

    async createInvite(courseId, invitedUserId, invitedById) {
        const inviteToken = crypto.randomBytes(32).toString("hex");

        const query = `
      INSERT INTO enrollments (user_id, course_id, status, invite_token, invited_by)
      VALUES ($1, $2, 'INVITED', $3, $4)
      ON CONFLICT (user_id, course_id) DO UPDATE 
      SET status = 'INVITED', invite_token = EXCLUDED.invite_token, invited_by = EXCLUDED.invited_by
      RETURNING *;
    `;

        const { rows } = await pool.query(query, [invitedUserId, courseId, inviteToken, invitedById]);

        // Stub for email sending
        console.log(`[Email Stub] Sending invite to user ${invitedUserId} for course ${courseId} with token ${inviteToken}`);

        return rows[0];
    }

    async getUserByEmail(email) {
        const { rows } = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        return rows[0];
    }

    async isCourseOwnerOrAdmin(courseId, userId, userRole, isSuperAdmin) {
        if (isSuperAdmin || (userRole || "").toLowerCase() === "admin") return true;
        const course = await this.getCourseById(courseId);
        return course && course.created_by === userId;
    }
}

export default new EnrollmentService();
