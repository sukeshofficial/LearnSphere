import React, { useState } from 'react';
import '../styles/reviewModal.css';

const AddReviewModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
    const [rating, setRating] = useState(0);
    const [text, setText] = useState("");
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError("Please select a star rating.");
            return;
        }
        if (text.trim().length < 5) {
            setError("Review text must be at least 5 characters.");
            return;
        }

        await onSubmit({ rating, review_text: text });
        // Reset and close handled by parent or success
        setRating(0);
        setText("");
        setError("");
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="review-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Write a Review</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="rating-selector">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className={`star-input ${star <= rating ? 'filled' : 'empty'}`}
                                onClick={() => setRating(star)}
                                style={{ color: star <= rating ? '#fbbf24' : '#e2e8f0', cursor: 'pointer' }}
                            >
                                ★
                            </span>
                        ))}
                    </div>

                    <div className="form-group">
                        <textarea
                            className="review-textarea"
                            placeholder="Share your experience with this course..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                        <button type="submit" className="submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Submit Review"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddReviewModal;
