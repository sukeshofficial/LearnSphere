import React from "react";
import BadgeList from "./BadgeList";
import "../styles/profilePanel.css";

const ProfilePointsPanel = ({ stats }) => {
    const totalPoints = parseInt(stats?.total_points || 0);
    const badgeName = stats?.badge || "Newbie";

    // Calculate progress (0 to 120 scale for the arc)
    const maxPoints = 120;
    const progress = Math.min((totalPoints / maxPoints) * 100, 100);
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <aside className="profile-panel">
            <h2>My profile</h2>

            <div className="points-widget">
                <div className="circular-progress">
                    <svg width="180" height="180">
                        <circle
                            stroke="#f1f5f9"
                            strokeWidth="10"
                            fill="transparent"
                            r={radius}
                            cx="90"
                            cy="90"
                        />
                        <circle
                            className="progress-ring-circle"
                            stroke="#6366f1"
                            strokeWidth="10"
                            strokeDasharray={`${circumference} ${circumference}`}
                            style={{ strokeDashoffset: offset }}
                            strokeLinecap="round"
                            fill="transparent"
                            r={radius}
                            cx="90"
                            cy="90"
                        />
                    </svg>
                    <div className="points-inner">
                        <span className="total-points-label">Total {totalPoints} Points</span>
                        <span className="points-value">{totalPoints}</span>
                        <span className="badge-name">{badgeName}</span>
                    </div>
                </div>
            </div>

            <BadgeList totalPoints={totalPoints} />
        </aside>
    );
};

export default ProfilePointsPanel;
