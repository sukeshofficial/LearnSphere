import React from 'react';
import '../styles/starRating.css';

const StarDisplay = ({ rating, size = "medium" }) => {
    // Round to nearest 0.5
    const roundedRating = Math.round(rating * 2) / 2;
    const stars = [];

    for (let i = 1; i <= 5; i++) {
        if (i <= roundedRating) {
            stars.push(<span key={i} className="star-icon filled">★</span>);
        } else if (i - 0.5 === roundedRating) {
            stars.push(<span key={i} className="star-icon half">★</span>);
        } else {
            stars.push(<span key={i} className="star-icon empty">★</span>);
        }
    }

    return (
        <div className={`star-row ${size}`}>
            {stars}
        </div>
    );
};

export default StarDisplay;
