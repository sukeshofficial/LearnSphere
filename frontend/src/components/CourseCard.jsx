import React, { useState, useEffect } from "react";
import * as coursesApi from "../services/coursesApi";
import "../styles/courseCard.css";

const CourseCard = ({ course, view, onEdit, onDelete, onStatusChange }) => {
    const [stats, setStats] = useState({ lessons: 0, duration_seconds: 0 });
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await coursesApi.getCourseById(course.id);
                // Backend returns { course, stats: { lessons, duration_seconds } }
                if (response.data.stats) {
                    setStats(response.data.stats);
                }
            } catch (error) {
                console.error("Error fetching course stats:", error);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchDetails();
    }, [course.id]);

    const handleShare = () => {
        const shareUrl = `${window.location.origin}/courses/${course.id}`;
        navigator.clipboard.writeText(shareUrl)
            .then(() => alert("Link copied to clipboard!"))
            .catch(err => console.error("Clipboard error:", err));
    };

    const handleTogglePublish = async () => {
        try {
            await coursesApi.publishCourse(course.id, !course.is_published);
            onStatusChange();
        } catch (error) {
            console.error("Error toggling publish status:", error);
        }
    };

    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`course-card ${view === "list" ? "list-view" : ""}`}>
            {course.is_published && <div className="publish-badge">Published</div>}

            <div className="card-header">
                <h3 className="course-title">{course.title}</h3>
            </div>

            <div className="course-tags">
                {(course.tags || []).map((tag, index) => (
                    <span key={index} className="tag">
                        {tag} <span className="remove-tag">×</span>
                    </span>
                ))}
            </div>

            <div className="course-stats">
                <div className="stat-item">
                    <span className="stat-label">Views</span>
                    <span className="stat-value">{course.total_views || 0}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Contents</span>
                    <span className="stat-value">{loadingStats ? "..." : stats.lessons}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Duration</span>
                    <span className="stat-value">{loadingStats ? "..." : formatDuration(stats.duration_seconds)}</span>
                </div>
            </div>

            <div className="card-actions">
                <button className="btn-icon" onClick={handleShare}>Share</button>
                <button className="btn-icon" onClick={() => onEdit(course)}>Edit</button>
                <button
                    className={`btn-icon ${course.is_published ? 'btn-unpublish' : 'btn-publish'}`}
                    onClick={handleTogglePublish}
                >
                    {course.is_published ? "Unpublish" : "Publish"}
                </button>
                <button className="btn-icon btn-delete" onClick={() => onDelete(course.id)}>Delete</button>
            </div>
        </div>
    );
};

export default CourseCard;
