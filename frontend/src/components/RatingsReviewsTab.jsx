import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as reviewApi from '../services/reviewApi';
import RatingSummary from './RatingSummary';
import ReviewsList from './ReviewsList';
import AddReviewModal from './AddReviewModal';
import { useAuth } from '../context/useAuth';
import '../styles/reviewsTab.css';

const RatingsReviewsTab = ({ courseId }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ average_rating: 0, count: 0 });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchReviews = async () => {
        try {
            const res = await reviewApi.getReviews(courseId);
            setReviews(res.data.reviews || []);
            setStats(res.data.stats || { average_rating: 0, count: 0 });
        } catch (err) {
            console.error("Error fetching reviews:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [courseId]);

    const handleAddReviewClick = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setIsModalOpen(true);
    };

    const handleSubmitReview = async (data) => {
        setSubmitting(true);
        try {
            await reviewApi.addReview(courseId, data);
            await fetchReviews();
            setIsModalOpen(false);
        } catch (err) {
            console.error("Submit review error:", err);
            alert(err.response?.data?.error || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading reviews...</div>;

    return (
        <div className="reviews-tab">
            <div className="reviews-header">
                <RatingSummary stats={stats} onAddReview={handleAddReviewClick} />
            </div>

            <ReviewsList reviews={reviews} />

            <AddReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmitReview}
                isSubmitting={submitting}
            />
        </div>
    );
};

export default RatingsReviewsTab;
