import React, { useState } from 'react';
import '../styles/tagInput.css';

const TagInput = ({ tags = [], onChange, placeholder = "Add a tag..." }) => {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

    const addTag = () => {
        const trimmed = inputValue.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
            setInputValue("");
        }
    };

    const removeTag = (index) => {
        const newTags = tags.filter((_, i) => i !== index);
        onChange(newTags);
    };

    return (
        <div className="tag-input-container">
            <div className="tags-list">
                {tags.map((tag, index) => (
                    <span key={index} className="tag-pill">
                        {tag}
                        <button
                            type="button"
                            className="tag-remove-btn"
                            onClick={() => removeTag(index)}
                        >
                            ×
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    className="tag-input-field"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={addTag}
                    placeholder={tags.length === 0 ? placeholder : ""}
                />
            </div>
        </div>
    );
};

export default TagInput;
