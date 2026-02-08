import React, { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import * as quizApi from "../services/quizApi";
import "../styles/quizPlayer.css";

const QuizPlayer = ({ quizId }) => {
    const { refreshStats } = useAuth();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({}); // { questionId: optionIndex }
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [score, setScore] = useState(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            setLoading(true);
            try {
                const res = await quizApi.getQuizFull(quizId);
                setQuiz(res.data);
                setAnswers({});
                setSubmitted(false);
                setScore(null);
            } catch (err) {
                console.error("Error fetching quiz:", err);
            } finally {
                setLoading(false);
            }
        };

        if (quizId) {
            fetchQuiz();
        }
    }, [quizId]);

    const handleOptionSelect = (questionId, optionIdx) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
    };

    const handleSubmit = async () => {
        let correctCount = 0;
        quiz.questions.forEach(q => {
            const selectedIdx = answers[q.id];
            if (selectedIdx !== undefined && q.options[selectedIdx]?.is_correct) {
                correctCount++;
            }
        });

        setSubmitting(true);
        try {
            // Format answers as expected by backend: [{ question_id, option_id }]
            const formattedAnswers = quiz.questions.map(q => {
                const selectedIdx = answers[q.id];
                const optionId = q.options[selectedIdx]?.id;
                return {
                    question_id: q.id,
                    option_id: optionId
                };
            }).filter(a => a.option_id !== undefined);

            // Submit results to backend
            const res = await quizApi.submitQuiz(quizId, formattedAnswers);

            // Backend returns result with correct_count and score
            setScore(res.data.correct_count);
            setSubmitted(true);

            // Refresh global stats so Navbar points update immediately
            await refreshStats();
        } catch (err) {
            console.error("Error submitting quiz:", err);
            alert("Failed to submit quiz results. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="quiz-loading">Loading Quiz...</div>;
    if (!quiz) return <div className="quiz-error">Failed to load quiz.</div>;

    return (
        <div className="quiz-player-container">
            <div className="quiz-header">
                <h2>{quiz.title}</h2>
                <p className="quiz-meta">{quiz.questions?.length || 0} Questions</p>
            </div>

            <div className="quiz-questions">
                {(quiz.questions || []).map((q, qIdx) => (
                    <div key={q.id} className="quiz-question-card">
                        <h3 className="question-text">
                            {qIdx + 1}. {q.question_text}
                        </h3>
                        <div className="options-grid">
                            {(q.options || []).map((opt, oIdx) => {
                                const isSelected = answers[q.id] === oIdx;
                                const isCorrect = opt.is_correct;
                                let optionClass = "option-item";

                                if (isSelected) optionClass += " selected";
                                if (submitted) {
                                    if (isCorrect) optionClass += " correct";
                                    else if (isSelected) optionClass += " incorrect";
                                    optionClass += " disabled";
                                }

                                return (
                                    <div
                                        key={oIdx}
                                        className={optionClass}
                                        onClick={() => handleOptionSelect(q.id, oIdx)}
                                    >
                                        <div className="option-indicator"></div>
                                        <span className="option-text">{opt.text}</span>
                                        {submitted && isCorrect && <span className="correct-label">✓ Correct</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="quiz-footer">
                {!submitted ? (
                    <button
                        className="btn-submit-quiz"
                        onClick={handleSubmit}
                        disabled={submitting || Object.keys(answers).length < (quiz.questions?.length || 0)}
                    >
                        {submitting ? "Submitting..." : "Submit Quiz"}
                    </button>
                ) : (
                    <div className="quiz-results">
                        <div className="score-display">
                            You scored <strong>{score}</strong> out of <strong>{quiz.questions?.length}</strong>
                        </div>
                        <button className="btn-retry-quiz" onClick={() => {
                            setAnswers({});
                            setSubmitted(false);
                            setScore(null);
                        }}>
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizPlayer;
