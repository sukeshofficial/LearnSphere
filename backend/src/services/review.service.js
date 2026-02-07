import pool from "../config/db.js";

class ReviewService {
    async createReview(courseId, userId, rating, reviewText) {
        const query = `
            INSERT INTO reviews (course_id, user_id, rating, review_text)
            VALUES ($1, $2, $3, $4)
            RETURNING id, course_id, user_id, rating, review_text, created_at;
        `;
        const { rows } = await pool.query(query, [courseId, userId, rating, reviewText]);
        return rows[0];
    }

    async getReviewsForCourse(courseId) {
        const query = `
            SELECT r.*, u.name as user_name, u.profile_photo
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.course_id = $1
            ORDER BY r.created_at DESC;
        `;
        const { rows } = await pool.query(query, [courseId]);
        return rows;
    }

    async getAverageRating(courseId) {
        const query = `
            SELECT 
                COALESCE(AVG(rating), 0) as average_rating,
                COUNT(*) as review_count
            FROM reviews
            WHERE course_id = $1;
        `;
        const { rows } = await pool.query(query, [courseId]);
        return {
            average_rating: parseFloat(rows[0].average_rating).toFixed(1),
            review_count: parseInt(rows[0].review_count)
        };
    }

    async deleteReview(reviewId, userId, isAdmin) {
        if (isAdmin) {
            await pool.query("DELETE FROM reviews WHERE id = $1", [reviewId]);
        } else {
            const { rowCount } = await pool.query(
                "DELETE FROM reviews WHERE id = $1 AND user_id = $2",
                [reviewId, userId]
            );
            if (rowCount === 0) return false;
        }
        return true;
    }
}

export default new ReviewService();
