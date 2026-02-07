import React, { useState } from "react";
import * as quizApi from "../services/quizApi";
import "../styles/rewardsPanel.css";

const RewardsPanel = ({ quizId, initialRewards, onSave }) => {
    const [rewards, setRewards] = useState({
        first_try: initialRewards?.attempt_1_points || 0,
        second_try: initialRewards?.attempt_2_points || 0,
        third_try: initialRewards?.attempt_3_points || 0,
        fourth_plus: initialRewards?.attempt_4_plus_points || 0
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (field, value) => {
        setRewards(prev => ({ ...prev, [field]: parseInt(value) || 0 }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await quizApi.setRewards(quizId, rewards);
            onSave();
            alert("Rewards updated successfully!");
        } catch (err) {
            console.error("Save rewards error:", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rewards-panel-view">
            <div className="rewards-header">
                <h2>🏆 Quiz Rewards</h2>
                <p>Set points awarded to participants based on their passing attempt.</p>
            </div>

            <div className="rewards-grid">
                <div className="reward-row">
                    <span className="reward-label">First try</span>
                    <div className="reward-input-wrapper">
                        <input
                            type="number"
                            value={rewards.first_try}
                            onChange={(e) => handleChange("first_try", e.target.value)}
                        />
                        <span className="reward-unit">points</span>
                    </div>
                </div>

                <div className="reward-row">
                    <span className="reward-label">Second try</span>
                    <div className="reward-input-wrapper">
                        <input
                            type="number"
                            value={rewards.second_try}
                            onChange={(e) => handleChange("second_try", e.target.value)}
                        />
                        <span className="reward-unit">points</span>
                    </div>
                </div>

                <div className="reward-row">
                    <span className="reward-label">Third try</span>
                    <div className="reward-input-wrapper">
                        <input
                            type="number"
                            value={rewards.third_try}
                            onChange={(e) => handleChange("third_try", e.target.value)}
                        />
                        <span className="reward-unit">points</span>
                    </div>
                </div>

                <div className="reward-row">
                    <span className="reward-label">Fourth+ try</span>
                    <div className="reward-input-wrapper">
                        <input
                            type="number"
                            value={rewards.fourth_plus}
                            onChange={(e) => handleChange("fourth_plus", e.target.value)}
                        />
                        <span className="reward-unit">points</span>
                    </div>
                </div>
            </div>

            <div className="rewards-footer">
                <button className="btn-editor btn-save" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Rewards"}
                </button>
            </div>

            <div className="rewards-notice">
                <p>Note: Participants only receive points once they pass the quiz (70% score or higher).</p>
            </div>
        </div>
    );
};

export default RewardsPanel;
