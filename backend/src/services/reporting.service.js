import pool from "../config/db.js";

class ReportingService {
    async getCourseCompletionStats(courseId) {
        const query = `
            WITH learner_progress AS (
                SELECT 
                    e.user_id,
                    COUNT(lp.lesson_id) FILTER (WHERE lp.completed = true) as completed_count,
                    (SELECT COUNT(*) FROM lessons WHERE course_id = $1) as total_lessons
                FROM enrollments e
                LEFT JOIN lesson_progress lp ON e.user_id = lp.user_id AND e.course_id = lp.course_id
                WHERE e.course_id = $1
                GROUP BY e.user_id
            ),
            learner_status AS (
                SELECT 
                    user_id,
                    CASE 
                        WHEN completed_count = 0 THEN 'YET_TO_START'
                        WHEN completed_count < total_lessons THEN 'IN_PROGRESS'
                        WHEN completed_count = total_lessons AND total_lessons > 0 THEN 'COMPLETED'
                        ELSE 'YET_TO_START'
                    END as status
                FROM learner_progress
            )
            SELECT 
                status,
                COUNT(*) as count
            FROM learner_status
            GROUP BY status;
        `;
        const { rows } = await pool.query(query, [courseId]);

        const stats = {
            YET_TO_START: 0,
            IN_PROGRESS: 0,
            COMPLETED: 0
        };

        rows.forEach(row => {
            stats[row.status] = parseInt(row.count);
        });

        return stats;
    }

    async getDetailedLearnerProgress(courseId) {
        const query = `
            SELECT 
                u.id, u.name, u.email,
                COUNT(lp.lesson_id) FILTER (WHERE lp.completed = true) as completed_lessons,
                (SELECT COUNT(*) FROM lessons WHERE course_id = $1) as total_lessons,
                COALESCE(MAX(qa.score), 0) as high_score
            FROM enrollments e
            JOIN users u ON e.user_id = u.id
            LEFT JOIN lesson_progress lp ON e.user_id = lp.user_id AND e.course_id = lp.course_id
            LEFT JOIN quizzes q ON q.course_id = $1
            LEFT JOIN quiz_attempts qa ON qa.user_id = u.id AND qa.quiz_id = q.id
            WHERE e.course_id = $1
            GROUP BY u.id;
        `;
        const { rows } = await pool.query(query, [courseId]);
        return rows.map(row => ({
            ...row,
            completion_percentage: row.total_lessons > 0 ? Math.round((row.completed_lessons / row.total_lessons) * 100) : 0
        }));
    }
}

export default new ReportingService();
