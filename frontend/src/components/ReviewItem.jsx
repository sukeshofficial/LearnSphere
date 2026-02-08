import React from 'react';
import StarDisplay from './StarDisplay';
import '../styles/reviewCard.css';
import avatarPlaceholder from '../assets/avatar-placeholder.png'; // Assuming exists, or use fallback

const ReviewItem = ({ review }) => {
    const avatarUrl = review.user_avatar || avatarPlaceholder;
    const initial = review.user_name ? review.user_name.charAt(0).toUpperCase() : '?';

    return (
        <div className="review-card">
            <div className="review-avatar">
                {review.user_avatar ? (
                    <img src={review.user_avatar} alt={review.user_name} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                ) : (
                    <span>{initial}</span>
                )}
            </div>
            <div className="review-content">
                <div className="review-header">
                    <div>
                        <span className="reviewer-name">{review.user_name || "Anonymous"}</span>
                        <StarDisplay rating={review.rating} size="small" />
                    </div>
                    <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString()}
                    </span>
                </div>
                <p className="review-text">{review.review_text}</p>
            </div>
        </div>
    );
};

export default ReviewItem;
