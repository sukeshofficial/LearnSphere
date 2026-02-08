import React from "react";
import { useNavigate } from "react-router-dom";
import { enrollInCourse } from "../api/enrollments";
import "../styles/userCourses.css";

const UserCourseCard = ({ course, user, onEnrollmentResult }) => {
    const navigate = useNavigate();
    const isEnrolled = course.is_enrolled || false;

    const handleJoin = async (e) => {
        e?.stopPropagation();
        try {
            if (!user) {
                navigate("/login");
                return;
            }
            const response = await enrollInCourse(course.id, null);

            // Check for success status
            if (response.data && response.data.status === "ACTIVE") {
                if (onEnrollmentResult) {
                    onEnrollmentResult(true, "Successfully enrolled in course!", course.id);
                }
            } else {
                // Fallback success/pending
                if (onEnrollmentResult) {
                    // Start learning immediately or just show success
                    onEnrollmentResult(true, "Enrolled! You can now start learning.", course.id);
                }
            }
        } catch (error) {
            console.error("Enrollment failed", error);
            const msg = error.response?.data?.message || "Failed to join course.";
            if (onEnrollmentResult) {
                onEnrollmentResult(false, msg);
            }
        }
    };

    const handleContinue = (e) => {
        e?.stopPropagation();
        navigate(`/courses/${course.id}/learn`);
    };

    const placeholderImage = "https://via.placeholder.com/400x225?text=Image+Unavailable";
    const imageUrl = course.image_url ? `http://localhost:5000${course.image_url}` : placeholderImage;

    return (
        <div className="user-course-card">
            <div className="card-image-container">
                <img
                    src={imageUrl}
                    alt={course.title}
                    className="card-course-img"
                    onError={(e) => { e.target.src = placeholderImage; }}
                />
            </div>

            <div className="card-content">
                <h3 className="card-title">{course.title}</h3>
                <p className="card-description">{course.description || "No description available."}</p>

                <div className="card-tags">
                    {(course.tags || []).map((tag, idx) => (
                        <span key={idx} className="card-tag">
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="card-actions">
                    {!user ? (
                        <button className="card-action-btn btn-login" onClick={(e) => { e.stopPropagation(); navigate("/login"); }}>
                            Login to continue
                        </button>
                    ) : isEnrolled ? (
                        <button className="card-action-btn btn-continue" onClick={handleContinue}>
                            Continue Course
                        </button>
                    ) : (
                        <button className="card-action-btn btn-join" onClick={handleJoin}>
                            Join Course
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserCourseCard;
