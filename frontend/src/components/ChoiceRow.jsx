import React from "react";
import "../styles/choiceRows.css";

const ChoiceRow = ({ option, onChange, onRemove }) => {
    return (
        <div className="choice-row">
            <input
                type="text"
                className="choice-input"
                placeholder="Option text..."
                value={option.text}
                onChange={(e) => onChange("text", e.target.value)}
            />

            <div className="checkbox-col">
                <div
                    className={`custom-checkbox ${option.is_correct ? "checked" : ""}`}
                    onClick={() => onChange("is_correct", !option.is_correct)}
                />
            </div>

            <div className="delete-col">
                <button
                    className="btn-remove-choice"
                    onClick={onRemove}
                    title="Remove choice"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default ChoiceRow;
