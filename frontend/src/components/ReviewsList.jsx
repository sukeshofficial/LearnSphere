import React from 'react';
import ReviewItem from './ReviewItem';

const ReviewsList = ({ reviews }) => {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="no-reviews">
                <h3>No reviews yet</h3>
                <p>Be the first to share your thoughts on this course!</p>
            </div>
        );
    }

    return (
        <div className="reviews-container">
            {reviews.map((review) => (
                <ReviewItem key={review.id} review={review} />
            ))}
        </div>
    );
};

export default ReviewsList;
