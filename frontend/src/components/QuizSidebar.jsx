import React from "react";
import QuestionListItem from "./QuestionListItem";
import "../styles/quizSidebar.css";

const QuizSidebar = ({ questions, activeQuestionId, onSelectQuestion, onAddQuestion, onShowRewards, view }) => {
    return (
        <aside className="quiz-sidebar">
            <div className="sidebar-header">
                <h3>Question List</h3>
            </div>

            <nav className="question-list">
                {questions.map((q, index) => (
                    <QuestionListItem
                        key={q.id}
                        question={q}
                        index={index}
                        isActive={activeQuestionId === q.id && view === "questions"}
                        onClick={() => onSelectQuestion(q.id)}
                    />
                ))}
            </nav>

            <div className="sidebar-footer">
                <button
                    className="sidebar-btn add-btn"
                    onClick={onAddQuestion}
                >
                    + Add Question
                </button>
                <button
                    className={`sidebar-btn rewards-btn ${view === "rewards" ? "active" : ""}`}
                    onClick={onShowRewards}
                >
                    🏆 Rewards
                </button>
            </div>
        </aside>
    );
};

export default QuizSidebar;
