import React from "react";
import "../styles/column-selector.css";

const ColumnSelector = ({ visibleColumns, onToggle }) => {
    const columns = [
        { id: "sno", label: "S.No" },
        { id: "course_name", label: "Course Name" },
        { id: "participant_name", label: "Participant Name" },
        { id: "enrolled_date", label: "Enrolled Date" },
        { id: "start_date", label: "Start Date" },
        { id: "time_spent", label: "Time Spent" },
        { id: "completion", label: "Completion %" },
        { id: "completed_date", label: "Completed Date" },
        { id: "status", label: "Status" }
    ];

    return (
        <div className="column-selector-panel">
            <h3>Display Columns</h3>
            <p>Pick which columns to show or hide</p>
            <div className="column-list">
                {columns.map(col => (
                    <label key={col.id} className="column-item">
                        <input
                            type="checkbox"
                            checked={visibleColumns.includes(col.id)}
                            onChange={() => onToggle(col.id)}
                        />
                        <span className="checkbox-custom"></span>
                        <span className="column-label">{col.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default ColumnSelector;
