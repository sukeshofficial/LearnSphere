import pool from "../config/db.js";

class LessonService {
    validateLesson(data) {
        const { title, type, duration_seconds } = data;
        const errors = [];

        if (!title || typeof title !== "string" || title.trim().length === 0) {
            errors.push("Title is required.");
        }

        const validTypes = ["VIDEO", "DOCUMENT", "IMAGE", "LINK"];
        if (!type || !validTypes.includes(type)) {
            errors.push(`Type must be one of: ${validTypes.join(", ")}`);
        }

        if (duration_seconds !== undefined && (typeof duration_seconds !== "number" || duration_seconds < 0)) {
            errors.push("Duration seconds must be a non-negative number.");
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    async createLesson(courseId, lessonData, userId) {
        const {
            title,
            type,
            content_url,
            duration_seconds,
            allow_download,
            description,
            order_index
        } = lessonData;

        const query = `
      INSERT INTO lessons (
        course_id, title, type, content_url, duration_seconds, 
        allow_download, description, order_index, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

        const values = [
            courseId,
            title,
            type,
            content_url || null,
            duration_seconds || 0,
            allow_download || false,
            description || null,
            order_index || 0,
            userId
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    async updateLesson(id, updateData) {
        const {
            title,
            type,
            content_url,
            duration_seconds,
            allow_download,
            description,
            order_index
        } = updateData;

        const query = `
      UPDATE lessons
      SET 
        title = $1, 
        type = $2, 
        content_url = $3, 
        duration_seconds = $4, 
        allow_download = $5, 
        description = $6, 
        order_index = $7, 
        updated_at = now()
      WHERE id = $8
      RETURNING *;
    `;

        const values = [
            title,
            type,
            content_url,
            duration_seconds,
            allow_download,
            description,
            order_index,
            id
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    async deleteLesson(id) {
        await pool.query("DELETE FROM lessons WHERE id = $1", [id]);
        return true;
    }

    async getLessonsByCourse(courseId) {
        const query = `
      SELECT id, title, type, duration_seconds, allow_download, order_index
      FROM lessons
      WHERE course_id = $1
      ORDER BY order_index ASC;
    `;
        const { rows } = await pool.query(query, [courseId]);
        return rows;
    }

    async getLessonById(id) {
        const { rows } = await pool.query("SELECT * FROM lessons WHERE id = $1", [id]);
        return rows[0];
    }

    async getCourseForOwnershipCheck(courseId) {
        const { rows } = await pool.query(
            "SELECT id, created_by, visibility, is_published FROM courses WHERE id = $1",
            [courseId]
        );
        return rows[0];
    }
}

export default new LessonService();
