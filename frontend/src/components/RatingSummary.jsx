import React from 'react';
import StarDisplay from './StarDisplay';
import '../styles/starRating.css';

const RatingSummary = ({ stats, onAddReview }) => {
    const { average_rating, count } = stats || { average_rating: 0, count: 0 };

    return (
        <div className="rating-summary-card">
            <div className="rating-large">
                <span className="rating-number">{Number(average_rating).toFixed(1)}</span>
                <div className="rating-stack">
                    <StarDisplay rating={average_rating} size="large" />
                    <span className="rating-count">{count} {count === 1 ? 'Rating' : 'Ratings'}</span>
                </div>
            </div>

            <button className="add-review-btn" onClick={onAddReview}>
                Add Review
            </button>
        </div>
    );
};

export default RatingSummary;
