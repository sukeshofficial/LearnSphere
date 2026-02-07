import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as quizApi from "../services/quizApi";
import BuilderHeaderBar from "../components/BuilderHeaderBar";
import QuizSidebar from "../components/QuizSidebar";
import QuestionEditorPanel from "../components/QuestionEditorPanel";
import RewardsPanel from "../components/RewardsPanel";
import "../styles/quizBuilderLayout.css";

const QuizBuilderPage = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [activeQuestionId, setActiveQuestionId] = useState(null);
    const [view, setView] = useState("questions"); // "questions" or "rewards"
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchQuiz = useCallback(async () => {
        setLoading(true);
        try {
            const res = await quizApi.getQuizFull(quizId);
            setQuiz(res.data);
            setQuestions(res.data.questions || []);

            // Only set active if not already set or if switching views
            if (res.data.questions?.length > 0 && !activeQuestionId) {
                setActiveQuestionId(res.data.questions[0].id);
            }
            setError(null);
        } catch (err) {
            console.error("Error fetching quiz:", err);
            setError("Failed to load quiz data.");
        } finally {
            setLoading(false);
        }
    }, [quizId, activeQuestionId]);

    useEffect(() => {
        fetchQuiz();
    }, [fetchQuiz]);

    const handleAddQuestion = async () => {
        try {
            const nextOrder = questions.length;
            const res = await quizApi.addQuestion(quizId, {
                question_text: "New Question",
                order_index: nextOrder,
                options: [
                    { text: "Option 1", is_correct: true },
                    { text: "Option 2", is_correct: false }
                ]
            });
            const newQuestion = res.data;
            await fetchQuiz();
            setActiveQuestionId(newQuestion.id);
            setView("questions");
        } catch (err) {
            console.error("Error adding question:", err);
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (!window.confirm("Delete this question?")) return;
        try {
            await quizApi.deleteQuestion(id);
            const remaining = questions.filter(q => q.id !== id);
            setQuestions(remaining);
            if (activeQuestionId === id) {
                setActiveQuestionId(remaining.length > 0 ? remaining[0].id : null);
            }
        } catch (err) {
            console.error("Error deleting question:", err);
        }
    };

    const handleUpdateTitle = async (newTitle) => {
        setQuiz(prev => ({ ...prev, title: newTitle }));
    };

    const handleSaveTitle = async () => {
        try {
            await quizApi.updateQuiz(quizId, quiz.title);
        } catch (err) {
            console.error("Error updating quiz title:", err);
        }
    };

    const activeQuestion = questions.find(q => q.id === activeQuestionId);
    const activeQuestionIndex = questions.findIndex(q => q.id === activeQuestionId);

    if (loading) return <div className="quiz-builder-loading">Building interface...</div>;
    if (error) return <div className="quiz-builder-error">{error}</div>;

    return (
        <div className="quiz-builder-container">
            <BuilderHeaderBar
                title={quiz?.title}
                onTitleChange={handleUpdateTitle}
                onTitleBlur={handleSaveTitle}
                onBack={() => navigate(-1)}
            />

            <div className="builder-layout">
                <QuizSidebar
                    questions={questions}
                    activeQuestionId={activeQuestionId}
                    onSelectQuestion={(id) => {
                        setActiveQuestionId(id);
                        setView("questions");
                    }}
                    onAddQuestion={handleAddQuestion}
                    onShowRewards={() => setView("rewards")}
                    view={view}
                />

                <main className="editor-panel-wrapper">
                    {view === "questions" ? (
                        activeQuestion ? (
                            <QuestionEditorPanel
                                question={activeQuestion}
                                index={activeQuestionIndex}
                                onSave={fetchQuiz}
                                onDelete={() => handleDeleteQuestion(activeQuestion.id)}
                            />
                        ) : (
                            <div className="no-questions-placeholder">
                                <p>Start by adding your first question.</p>
                                <button onClick={handleAddQuestion} className="btn-editor btn-save">
                                    + Add Question
                                </button>
                            </div>
                        )
                    ) : (
                        <RewardsPanel
                            quizId={quizId}
                            initialRewards={quiz?.rewards}
                            onSave={fetchQuiz}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default QuizBuilderPage;
