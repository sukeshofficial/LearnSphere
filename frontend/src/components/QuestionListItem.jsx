import React from "react";

const QuestionListItem = ({ question, index, isActive, onClick }) => {
    return (
        <div
            className={`question-item ${isActive ? "active" : ""}`}
            onClick={onClick}
        >
            <span className="q-prefix">Q{index + 1}</span>
            <span className="q-label">Question {index + 1}</span>
        </div>
    );
};

export default QuestionListItem;
