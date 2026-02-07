import React, { useState, useEffect } from "react";
import ChoiceRow from "./ChoiceRow";
import * as quizApi from "../services/quizApi";
import "../styles/questionEditor.css";
import "../styles/choiceRows.css";

const QuestionEditorPanel = ({ question, index, onSave, onDelete }) => {
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

    const handleOptionChange = (idx, field, value) => {
        const newOptions = [...options];
        newOptions[idx] = { ...newOptions[idx], [field]: value };
        setOptions(newOptions);
    };

    const handleRemoveOption = (idx) => {
        if (options.length <= 2) {
            alert("A question must have at least 2 choices.");
            return;
        }
        setOptions(options.filter((_, i) => i !== idx));
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
        <div className="question-editor-panel">
            <div className="editor-header">
                <h2>Editing Question</h2>
                <div className="header-actions">
                    <button className="btn-editor btn-delete" onClick={onDelete}>Delete Question</button>
                    <button className="btn-editor btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save Question"}
                    </button>
                </div>
            </div>

            <div className="editor-body">
                <div className="question-input-group">
                    <span className="question-number-prefix">{index + 1}.</span>
                    <textarea
                        className="question-textarea"
                        placeholder="Write your question here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                </div>

                <div className="choices-section">
                    <div className="choices-grid-header">
                        <span>Choices</span>
                        <span style={{ textAlign: 'center' }}>Correct</span>
                        <span></span>
                    </div>

                    <div className="choices-container">
                        {options.map((opt, idx) => (
                            <ChoiceRow
                                key={opt.id || idx}
                                option={opt}
                                onChange={(field, value) => handleOptionChange(idx, field, value)}
                                onRemove={() => handleRemoveOption(idx)}
                            />
                        ))}
                    </div>

                    <div className="add-choice-wrapper">
                        <button className="btn-add-choice-link" onClick={handleAddChoice}>
                            + Add choice
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionEditorPanel;
