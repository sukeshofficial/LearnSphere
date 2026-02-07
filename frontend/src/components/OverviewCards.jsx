import React from "react";

const OverviewCards = ({ stats, activeFilter, onFilterChange }) => {
    const cards = [
        { key: "TOTAL", label: "Total Participants", count: stats.total, className: "total" },
        { key: "NOT_STARTED", label: "Yet to Start", count: stats.notStarted, className: "not-started" },
        { key: "IN_PROGRESS", label: "In Progress", count: stats.inProgress, className: "in-progress" },
        { key: "COMPLETED", label: "Completed", count: stats.completed, className: "completed" }
    ];

    return (
        <div className="cards-row">
            {cards.map((card) => (
                <div
                    key={card.key}
                    className={`report-card ${card.className} ${activeFilter === card.key ? "active" : ""}`}
                    onClick={() => onFilterChange(card.key)}
                >
                    <span className="card-label">{card.label}</span>
                    <span className="card-count">{card.count}</span>
                </div>
            ))}
        </div>
    );
};

export default OverviewCards;
