import quizService from "../services/quiz.service.js";

class QuizController {
    createQuiz = async (req, res) => {
        try {
            const { courseId } = req.body;
            const { title } = req.body;
            if (!courseId || !title) return res.status(400).json({ error: "courseId and title are required" });

            const quiz = await quizService.createQuiz(courseId, req.user.id, title);
            return res.status(201).json(quiz);
        } catch (error) {
            console.error("Create Quiz Error:", error);
            return res.status(500).json({ error: "Failed to create quiz" });
        }
    };

    addQuestion = async (req, res) => {
        try {
            const { quizId } = req.params;
            const { question_text, order_index, options } = req.body;

            const question = await quizService.addQuestion(quizId, question_text, order_index || 0);

            if (options && Array.isArray(options)) {
                for (const opt of options) {
                    await quizService.addOption(question.id, opt.text, opt.is_correct, opt.order || 0);
                }
            }

            return res.status(201).json(question);
        } catch (error) {
            console.error("Add Question Error:", error);
            return res.status(500).json({ error: "Failed to add question" });
        }
    };

    setRewards = async (req, res) => {
        try {
            const { quizId } = req.params;
            const rewards = await quizService.setRewards(quizId, req.body);
            return res.status(200).json(rewards);
        } catch (error) {
            console.error("Set Rewards Error:", error);
            return res.status(500).json({ error: "Failed to set rewards" });
        }
    };

    getQuiz = async (req, res) => {
        try {
            const { id } = req.params;
            const quiz = await quizService.getQuizFull(id);
            if (!quiz) return res.status(404).json({ error: "Quiz not found" });

            return res.status(200).json(quiz);
        } catch (error) {
            console.error("Get Quiz Error:", error);
            return res.status(500).json({ error: "Failed to fetch quiz" });
        }
    };

    submitQuiz = async (req, res) => {
        try {
            const { id } = req.params;
            const { answers } = req.body; // Array of { question_id, option_id }

            if (!answers || !Array.isArray(answers)) {
                return res.status(400).json({ error: "Answers are required" });
            }

            const result = await quizService.submitAttempt(id, req.user.id, answers);
            return res.status(200).json(result);
        } catch (error) {
            console.error("Submit Quiz Error:", error);
            return res.status(500).json({ error: "Failed to submit quiz" });
        }
    };
}

export default new QuizController();
