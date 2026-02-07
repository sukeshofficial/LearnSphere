import pool from "../config/db.js";

class CourseService {
    async createCourse(courseData) {
        const {
            title,
            short_description,
            long_description,
            tags,
            visibility,
            access_rule,
            price_cents,
            created_by
        } = courseData;

        const query = `
      INSERT INTO courses (
        title, short_description, long_description, tags, 
        visibility, access_rule, price_cents, created_by, is_published
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)
      RETURNING id, title, short_description, tags, visibility, 
                access_rule, price_cents, is_published, created_by, created_at;
    `;

        const values = [
            title,
            short_description || null,
            long_description || null,
            tags || [],
            visibility,
            access_rule,
            price_cents || 0,
            created_by
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    async getAllCourses(filters) {
        const { q, tags, page = 1, limit = 10, userId } = filters;
        const offset = (page - 1) * limit;

        let queryText = `
      SELECT id, title, short_description, tags, visibility, 
             access_rule, price_cents, is_published, created_by, created_at, total_views
      FROM courses
      WHERE is_published = true
    `;

        const values = [];
        let paramCount = 1;

        // Visibility rules
        if (!userId) {
            queryText += ` AND visibility = 'EVERYONE'`;
        } else {
            queryText += ` AND (visibility = 'EVERYONE' OR visibility = 'SIGNED_IN')`;
        }

        if (q) {
            queryText += ` AND title ILIKE $${paramCount}`;
            values.push(`%${q}%`);
            paramCount++;
        }

        if (tags) {
            const tagList = tags.split(",");
            queryText += ` AND tags && $${paramCount}`;
            values.push(tagList);
            paramCount++;
        }

        // Count total matches before pagination
        const countQuery = `SELECT COUNT(*) FROM (${queryText}) AS matches`;
        const { rows: countRows } = await pool.query(countQuery, values);
        const total = parseInt(countRows[0].count);

        queryText += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        values.push(limit, offset);

        const { rows } = await pool.query(queryText, values);

        return {
            items: rows,
            meta: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async getCourseById(id, userId) {
        await pool.query("BEGIN");
        try {
            const { rows } = await pool.query(
                "SELECT * FROM courses WHERE id = $1",
                [id]
            );

            const course = rows[0];
            if (!course) {
                await pool.query("ROLLBACK");
                return null;
            }

            // Check visibility
            if (!course.is_published) {
                // Only allow owner or admin to see unpublished (handled in controller usually, but safe here)
            } else if (course.visibility === "SIGNED_IN" && !userId) {
                await pool.query("ROLLBACK");
                return { error: "AUTHENTICATION_REQUIRED" };
            }

            // Increment views
            await pool.query(
                "UPDATE courses SET total_views = total_views + 1 WHERE id = $1",
                [id]
            );

            // Get stats
            const statsQuery = `
        SELECT 
          COUNT(id) as lessons,
          COALESCE(SUM(duration_seconds), 0) as duration_seconds
        FROM lessons
        WHERE course_id = $1
      `;
            const { rows: statsRows } = await pool.query(statsQuery, [id]);

            await pool.query("COMMIT");

            return {
                course,
                stats: statsRows[0]
            };
        } catch (error) {
            await pool.query("ROLLBACK");
            throw error;
        }
    }

    async updateCourse(id, updateData) {
        const {
            title,
            short_description,
            tags,
            visibility,
            access_rule,
            price_cents
        } = updateData;

        const query = `
      UPDATE courses
      SET title = $1, short_description = $2, tags = $3, 
          visibility = $4, access_rule = $5, price_cents = $6, updated_at = now()
      WHERE id = $7
      RETURNING *;
    `;

        const { rows } = await pool.query(query, [
            title,
            short_description,
            tags,
            visibility,
            access_rule,
            price_cents,
            id
        ]);

        return rows[0];
    }

    async setPublishStatus(id, is_published) {
        const query = `
      UPDATE courses
      SET is_published = $1, updated_at = now()
      WHERE id = $2
      RETURNING id, is_published;
    `;
        const { rows } = await pool.query(query, [is_published, id]);
        return rows[0];
    }

    async deleteCourse(id) {
        const query = "DELETE FROM courses WHERE id = $1";
        await pool.query(query, [id]);
        return true;
    }

    async getRawCourse(id) {
        const { rows } = await pool.query("SELECT * FROM courses WHERE id = $1", [id]);
        return rows[0];
    }
}

export default new CourseService();
