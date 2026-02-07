import React from "react";
import "../styles/builderHeaderBar.css";

const BuilderHeaderBar = ({ title, onTitleChange, onTitleBlur, onBack }) => {
    return (
        <header className="builder-header-bar">
            <button className="back-link-btn" onClick={onBack}>
                <span>←</span> Back
            </button>

            <div className="quiz-title-input-wrapper">
                <input
                    type="text"
                    className="quiz-name-input"
                    value={title || ""}
                    onChange={(e) => onTitleChange(e.target.value)}
                    onBlur={onTitleBlur}
                    placeholder="Enter Quiz Title..."
                />
            </div>
        </header>
    );
};

export default BuilderHeaderBar;
