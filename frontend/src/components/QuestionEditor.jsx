import React, { useState, useEffect } from "react";
import ChoiceRow from "./ChoiceRow";
import * as quizApi from "../services/quizApi";

const QuestionEditor = ({ question, onSave, onDelete }) => {
    const [text, setText] = useState(question.question_text || "");
    const [options, setOptions] = useState(question.options || []);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setText(question.question_text || "");
        setOptions(question.options || []);
    }, [question]);

    const handleAddChoice = () => {
        setOptions([...options, { text: "", is_correct: false, id: Date.now() }]);
    };

    const handleOptionChange = (index, field, value) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], [field]: value };
        setOptions(newOptions);
    };

    const handleRemoveOption = (index) => {
        if (options.length <= 2) {
            alert("A question must have at least 2 choices.");
            return;
        }
        setOptions(options.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!text.trim()) {
            alert("Question text is required.");
            return;
        }
        if (options.some(opt => !opt.text.trim())) {
            alert("All choices must have text.");
            return;
        }
        if (!options.some(opt => opt.is_correct)) {
            alert("At least one choice must be marked as correct.");
            return;
        }

        setSaving(true);
        try {
            await quizApi.updateQuestion(question.id, {
                question_text: text,
                options: options.map(o => ({ text: o.text, is_correct: o.is_correct }))
            });
            onSave();
        } catch (err) {
            console.error("Save question error:", err);
            alert("Failed to save question.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="question-editor">
            <div className="editor-header">
                <h2>Editing Question</h2>
                <div className="header-actions">
                    <button className="btn-delete" onClick={onDelete}>Delete Question</button>
                    <button className="btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save Question"}
                    </button>
                </div>
            </div>

            <div className="form-group">
                <label>Question Text</label>
                <textarea
                    className="editor-textarea"
                    placeholder="Write your question here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            </div>

            <div className="choices-section">
                <div className="choices-header">
                    <span>Choices</span>
                    <span className="correct-label">Correct</span>
                </div>
                <div className="choices-list">
                    {options.map((opt, index) => (
                        <ChoiceRow
                            key={opt.id || index}
                            option={opt}
                            onChange={(field, value) => handleOptionChange(index, field, value)}
                            onRemove={() => handleRemoveOption(index)}
                        />
                    ))}
                </div>
                <button className="add-choice-btn" onClick={handleAddChoice}>
                    + Add choice
                </button>
            </div>
        </div>
    );
};

export default QuestionEditor;
