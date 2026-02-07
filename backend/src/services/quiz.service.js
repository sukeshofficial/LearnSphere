import pool from "../config/db.js";

class QuizService {
    async createQuiz(courseId, userId, title) {
        const query = `
            INSERT INTO quizzes (course_id, title, created_by)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [courseId, title, userId]);
        return rows[0];
    }

    async updateQuiz(quizId, title) {
        const query = `UPDATE quizzes SET title = $1 WHERE id = $2 RETURNING *`;
        const { rows } = await pool.query(query, [title, quizId]);
        return rows[0];
    }

    async addQuestion(quizId, questionText, orderIndex) {
        const query = `
            INSERT INTO quiz_questions (quiz_id, question_text, order_index)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [quizId, questionText, orderIndex]);
        return rows[0];
    }

    async updateQuestion(questionId, questionText, options) {
        await pool.query("BEGIN");
        try {
            // Update question text
            await pool.query(
                `UPDATE quiz_questions SET question_text = $1 WHERE id = $2`,
                [questionText, questionId]
            );

            // Replace options (Delete existing, insert new)
            await pool.query(`DELETE FROM quiz_options WHERE question_id = $1`, [questionId]);

            if (options && Array.isArray(options)) {
                for (let i = 0; i < options.length; i++) {
                    const opt = options[i];
                    await pool.query(
                        `INSERT INTO quiz_options (question_id, option_text, is_correct, order_index) VALUES ($1, $2, $3, $4)`,
                        [questionId, opt.text, opt.is_correct, i]
                    );
                }
            }

            await pool.query("COMMIT");
            return { id: questionId, question_text: questionText };
        } catch (error) {
            await pool.query("ROLLBACK");
            throw error;
        }
    }

    async deleteQuestion(questionId) {
        const query = `DELETE FROM quiz_questions WHERE id = $1 RETURNING *`;
        const { rows } = await pool.query(query, [questionId]);
        return rows[0];
    }

    async addOption(questionId, optionText, isCorrect, orderIndex) {
        const query = `
            INSERT INTO quiz_options (question_id, option_text, is_correct, order_index)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [questionId, optionText, isCorrect, orderIndex]);
        return rows[0];
    }

    async setRewards(quizId, rewards) {
        const attempt_1 = rewards.attempt_1 ?? rewards.first_try ?? 0;
        const attempt_2 = rewards.attempt_2 ?? rewards.second_try ?? 0;
        const attempt_3 = rewards.attempt_3 ?? rewards.third_try ?? 0;
        const attempt_4_plus = rewards.attempt_4_plus ?? rewards.fourth_plus ?? 0;
        const query = `
            INSERT INTO quiz_rewards (quiz_id, attempt_1_points, attempt_2_points, attempt_3_points, attempt_4_plus_points)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (quiz_id) DO UPDATE SET
                attempt_1_points = $2,
                attempt_2_points = $3,
                attempt_3_points = $4,
                attempt_4_plus_points = $5
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [quizId, attempt_1, attempt_2, attempt_3, attempt_4_plus]);
        return rows[0];
    }

    async getQuizFull(quizId) {
        const quizQuery = `SELECT * FROM quizzes WHERE id = $1`;
        const { rows: quizRows } = await pool.query(quizQuery, [quizId]);
        if (quizRows.length === 0) return null;

        const questionsQuery = `
            SELECT q.*, 
                   json_agg(json_build_object('id', o.id, 'text', o.option_text, 'order', o.order_index)) as options
            FROM quiz_questions q
            LEFT JOIN quiz_options o ON q.id = o.question_id
            WHERE q.quiz_id = $1
            GROUP BY q.id
            ORDER BY q.order_index;
        `;
        const { rows: questions } = await pool.query(questionsQuery, [quizId]);

        const rewardsQuery = `SELECT * FROM quiz_rewards WHERE quiz_id = $1`;
        const { rows: rewards } = await pool.query(rewardsQuery, [quizId]);

        return {
            ...quizRows[0],
            questions,
            rewards: rewards[0] || null
        };
    }

    async submitAttempt(quizId, userId, answers) {
        // 1. Get correct answers
        const correctAnswersQuery = `
            SELECT q.id as question_id, o.id as option_id
            FROM quiz_questions q
            JOIN quiz_options o ON q.id = o.question_id
            WHERE q.quiz_id = $1 AND o.is_correct = true;
        `;
        const { rows: correctRows } = await pool.query(correctAnswersQuery, [quizId]);

        // 2. Calculate score
        let correctCount = 0;
        const totalQuestions = correctRows.length;

        correctRows.forEach(row => {
            const userAnswer = answers.find(a => a.question_id === row.question_id);
            if (userAnswer && userAnswer.option_id === row.option_id) {
                correctCount++;
            }
        });

        const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

        // 3. Determine attempt number
        const attemptsQuery = `SELECT COUNT(*) FROM quiz_attempts WHERE user_id = $1 AND quiz_id = $2`;
        const { rows: attemptsRows } = await pool.query(attemptsQuery, [userId, quizId]);
        const attemptNumber = parseInt(attemptsRows[0].count) + 1;

        // 4. Calculate points based on rewards
        const rewardsQuery = `SELECT * FROM quiz_rewards WHERE quiz_id = $1`;
        const { rows: rewardsRows } = await pool.query(rewardsQuery, [quizId]);
        const rewards = rewardsRows[0] || { attempt_1_points: 0, attempt_2_points: 0, attempt_3_points: 0, attempt_4_plus_points: 0 };

        let pointsEarned = 0;
        if (score >= 70) { // Passing threshold
            if (attemptNumber === 1) pointsEarned = rewards.attempt_1_points;
            else if (attemptNumber === 2) pointsEarned = rewards.attempt_2_points;
            else if (attemptNumber === 3) pointsEarned = rewards.attempt_3_points;
            else pointsEarned = rewards.attempt_4_plus_points;
        }

        // 5. Save attempt
        const insertAttemptQuery = `
            INSERT INTO quiz_attempts (quiz_id, user_id, score, attempt_number, status, points_earned, completed_at)
            VALUES ($1, $2, $3, $4, 'GRADED', $5, now())
            RETURNING *;
        `;
        const { rows: attemptRows } = await pool.query(insertAttemptQuery, [quizId, userId, score, attemptNumber, pointsEarned]);

        // 6. Automatic Lesson Completion if pass
        if (score >= 70) {
            const courseQuery = `SELECT course_id FROM quizzes WHERE id = $1`;
            const { rows: quizCourse } = await pool.query(courseQuery, [quizId]);
            if (quizCourse.length > 0) {
                const courseId = quizCourse[0].course_id;
                // Find a lesson of type QUIZ in this course
                const lessonQuery = `SELECT id FROM lessons WHERE course_id = $1 AND type = 'QUIZ' LIMIT 1`;
                const { rows: lessons } = await pool.query(lessonQuery, [courseId]);
                if (lessons.length > 0) {
                    const lessonId = lessons[0].id;
                    await pool.query(`
                        INSERT INTO lesson_progress (user_id, lesson_id, course_id, completed, completed_at)
                        VALUES ($1, $2, $3, true, now())
                        ON CONFLICT (user_id, lesson_id) DO UPDATE SET completed = true, completed_at = now();
                    `, [userId, lessonId, courseId]);
                }
            }
        }
        return {
            attempt: attemptRows[0],
            correct_count: correctCount,
            total_questions: totalQuestions,
            score
        };
    }

    async getQuizzesByCourse(courseId) {
        const query = `SELECT * FROM quizzes WHERE course_id = $1 ORDER BY created_at DESC`;
        const { rows } = await pool.query(query, [courseId]);
        return rows;
    }
}

export default new QuizService();
