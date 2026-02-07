import React from "react";
import "../styles/learnerCard.css";

const LearnerCourseCard = ({ course, user, onAction }) => {
    const isEnrolled = course.user_enrollment_status === 'ACTIVE' || course.user_enrollment_status === 'COMPLETED';
    const isPaid = course.access_rule === 'PAID';
    const hasPurchased = course.user_enrollment_status === 'ACTIVE' || course.user_enrollment_status === 'COMPLETED';

    // Determine button state
    let buttonLabel = "Join Course";
    let buttonClass = "btn-status btn-join";
    let action = "join";

    if (!user) {
        buttonLabel = "Join Course";
        action = "login";
    } else if (isEnrolled) {
        if (course.progress_percent > 0) {
            buttonLabel = "Continue";
            buttonClass = "btn-status btn-continue";
            action = "continue";
        } else {
            buttonLabel = "Start";
            buttonClass = "btn-status btn-start";
            action = "start";
        }
    } else if (isPaid && !hasPurchased) {
        buttonLabel = `Buy Course (INR ${course.price_cents / 100})`;
        buttonClass = "btn-status btn-buy";
        action = "buy";
    } else if (course.access_rule === 'OPEN' || course.access_rule === 'INVITE') {
        buttonLabel = "Start";
        buttonClass = "btn-status btn-start";
        action = "enroll";
    }

    const imageUrl = course.image_url ? `http://localhost:5000${course.image_url}` : "https://via.placeholder.com/400x225?text=Course+Cover";

    return (
        <div className="learner-course-card">
            {isPaid && hasPurchased && <div className="paid-badge">Paid</div>}

            <div className="card-image-wrapper">
                <img src={imageUrl} alt={course.title} className="course-cover" />
            </div>

            <div className="card-body">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-desc">{course.short_description}</p>

                <div className="course-tags">
                    {(course.tags || []).map((tag, idx) => (
                        <span key={idx} className="tag-pill">{tag}</span>
                    ))}
                </div>
            </div>

            <div className="card-footer">
                {isPaid && !hasPurchased && <span className="price-display">INR {course.price_cents / 100}</span>}
                <button
                    className={buttonClass}
                    onClick={() => onAction(action, course)}
                >
                    {buttonLabel}
                </button>
            </div>
        </div>
    );
};

export default LearnerCourseCard;
