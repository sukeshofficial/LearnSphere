import React from "react";

const CourseTabs = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: "content", label: "Content" },
        { id: "description", label: "Description" },
        { id: "options", label: "Options" },
        { id: "quiz", label: "Quiz" }
    ];

    return (
        <div className="course-tabs-nav">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default CourseTabs;
