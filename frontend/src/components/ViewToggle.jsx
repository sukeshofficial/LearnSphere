import React from "react";
import "../styles/toggle.css";

const ViewToggle = ({ view, onViewChange }) => {
    return (
        <div className="view-toggle">
            <button
                className={`toggle-btn ${view === "kanban" ? "active" : ""}`}
                onClick={() => onViewChange("kanban")}
                title="Kanban View"
            >
                <svg
                    className="toggle-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                </svg>
            </button>
            <button
                className={`toggle-btn ${view === "list" ? "active" : ""}`}
                onClick={() => onViewChange("list")}
                title="List View"
            >
                <svg
                    className="toggle-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
            </button>
        </div>
    );
};

export default ViewToggle;
