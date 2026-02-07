import pool from "../config/db.js";

class ProgressService {
    async updateLessonProgress(userId, lessonId, courseId, completed, timeSpent = 0) {
        const query = `
            INSERT INTO lesson_progress (user_id, lesson_id, course_id, completed, completed_at, time_spent_seconds)
            VALUES ($1, $2, $3, $4, CASE WHEN $4 = true THEN now() ELSE NULL END, $5)
            ON CONFLICT (user_id, lesson_id)
            DO UPDATE SET 
                completed = $4,
                completed_at = CASE WHEN $4 = true AND lesson_progress.completed = false THEN now() ELSE lesson_progress.completed_at END,
                time_spent_seconds = lesson_progress.time_spent_seconds + $5
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [userId, lessonId, courseId, completed, timeSpent]);
        return rows[0];
    }

    async getCourseProgress(userId, courseId) {
        // Total lessons count
        const totalLessonsQuery = `SELECT COUNT(*) FROM lessons WHERE course_id = $1`;
        const { rows: totalRows } = await pool.query(totalLessonsQuery, [courseId]);
        const totalLessons = parseInt(totalRows[0].count);

        if (totalLessons === 0) return { completion_percentage: 0, completed_lessons: 0, total_lessons: 0 };

        // Completed lessons count
        const completedQuery = `
            SELECT COUNT(*) 
            FROM lesson_progress 
            WHERE user_id = $1 AND course_id = $2 AND completed = true
        `;
        const { rows: completedRows } = await pool.query(completedQuery, [userId, courseId]);
        const completedLessons = parseInt(completedRows[0].count);

        const percentage = Math.round((completedLessons / totalLessons) * 100);

        return {
            completion_percentage: percentage,
            completed_lessons: completedLessons,
            total_lessons: totalLessons
        };
    }

    async getLearnerStats(userId) {
        const query = `
            SELECT 
                COUNT(DISTINCT course_id) as courses_enrolled,
                SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as lessons_completed,
                (SELECT COALESCE(SUM(points_earned), 0) FROM quiz_attempts WHERE user_id = $1) as total_points
            FROM enrollments
            LEFT JOIN lesson_progress ON enrollments.user_id = lesson_progress.user_id AND enrollments.course_id = lesson_progress.course_id
            WHERE enrollments.user_id = $1;
        `;
        const { rows } = await pool.query(query, [userId]);
        const stats = rows[0];

        // Simple badge calculation local logic
        let badge = "Novice";
        const points = parseInt(stats.total_points);
        if (points >= 1000) badge = "Expert";
        else if (points >= 500) badge = "Advanced";
        else if (points >= 100) badge = "Intermediate";

        return {
            ...stats,
            badge
        };
    }
}

export default new ProgressService();
