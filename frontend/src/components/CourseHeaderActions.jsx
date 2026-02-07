import React from "react";
import "../styles/headerActions.css";

const CourseHeaderActions = ({
    isPublished,
    onPublishToggle,
    onPreview,
    onNew,
    onInvite,
    onContact
}) => {
    return (
        <div className="course-header-actions">
            <div className="left-actions">
                <button className="action-btn new-mode" onClick={onNew}>New</button>
                <button className="action-btn" onClick={onContact}>Contact Attendees</button>
                <button className="action-btn" onClick={onInvite}>Add Attendees</button>
            </div>
            <div className="right-actions">
                <div className="publish-switch-group">
                    <span className="publish-label">Publish on website</span>
                    <label className="switch-container">
                        <input
                            type="checkbox"
                            className="switch-input"
                            checked={isPublished}
                            onChange={(e) => onPublishToggle(e.target.checked)}
                        />
                        <span className="switch-slider round"></span>
                    </label>
                </div>
                <button className="action-btn preview-btn" onClick={onPreview}>Preview</button>
            </div>
        </div>
    );
};

export default CourseHeaderActions;
