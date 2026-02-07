import React from "react";
import "../styles/playerSidebar.css";
// Icons can be added later if needed, using generic placeholders for now

const LessonSidebar = ({ lessons, activeLessonId, onLessonSelect, courseTitle }) => {
    return (
        <aside className="player-sidebar">
            <div className="sidebar-header">
                <h2>{courseTitle}</h2>
            </div>
            <div className="lesson-list">
                {lessons.map((lesson, index) => (
                    <div
                        key={lesson.id}
                        className={`lesson-item ${activeLessonId === lesson.id ? "active" : ""}`}
                        onClick={() => onLessonSelect(lesson)}
                    >
                        <div className="lesson-icon">
                            {/* Simple placeholder icon */}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {lesson.type === 'VIDEO' ? (
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                ) : (
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                )}
                            </svg>
                        </div>
                        <div className="lesson-info">
                            <h4 className="lesson-title">
                                {index + 1}. {lesson.title}
                            </h4>
                            {lesson.duration_seconds > 0 && (
                                <span className="lesson-duration">
                                    {Math.floor(lesson.duration_seconds / 60)}:{(lesson.duration_seconds % 60).toString().padStart(2, '0')}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default LessonSidebar;
