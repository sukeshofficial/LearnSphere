import React from "react";
import "../styles/profilePanel.css";

const BadgeList = ({ totalPoints }) => {
    const badges = [
        { name: "Newbie", points: 20 },
        { name: "Explorer", points: 40 },
        { name: "Achiever", points: 60 },
        { name: "Specialist", points: 80 },
        { name: "Expert", points: 100 },
        { name: "Master", points: 120 }
    ];

    return (
        <div className="badge-list-container">
            <h3>Badges</h3>
            <div className="badge-table">
                {badges.map((badge, idx) => (
                    <div
                        key={idx}
                        className={`badge-row ${totalPoints >= badge.points ? "earned" : ""}`}
                    >
                        <span className="badge-label">{badge.name}</span>
                        <span className="badge-points">{badge.points} Points</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BadgeList;
