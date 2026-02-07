import React from "react";

const CourseHeaderActions = ({
    onNew,
    onContact,
    onInvite,
    onPreview,
    isPublished,
    onPublishToggle
}) => {
    return (
        <div className="course-header-actions">
            <div className="left-actions">
                <button className="action-btn new" onClick={onNew}>New</button>
                <button className="action-btn contact" onClick={onContact}>Contact Attendees</button>
                <button className="action-btn invite" onClick={onInvite}>Add Attendees</button>
            </div>
            <div className="right-actions">
                <div className="publish-control">
                    <span>Publish on website</span>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={isPublished}
                            onChange={(e) => onPublishToggle(e.target.checked)}
                        />
                        <span className="slider round"></span>
                    </label>
                </div>
                <button className="action-btn preview" onClick={onPreview}>Preview</button>
            </div>
        </div>
    );
};

export default CourseHeaderActions;
