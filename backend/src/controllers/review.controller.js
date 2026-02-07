import reviewService from "../services/review.service.js";

class ReviewController {
    addReview = async (req, res) => {
        try {
            const { courseId } = req.params;
            const { rating, review_text } = req.body;
            const userId = req.user.id;

            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).json({ error: "Rating must be between 1 and 5" });
            }

            const review = await reviewService.createReview(courseId, userId, rating, review_text);
            return res.status(201).json(review);
        } catch (error) {
            console.error("Add Review Error:", error);
            if (error.code === '23505') { // Unique constraint violation (if we added it)
                return res.status(400).json({ error: "You have already reviewed this course" });
            }
            return res.status(500).json({ error: "Failed to add review" });
        }
    };

    getCourseReviews = async (req, res) => {
        try {
            const { courseId } = req.params;
            const reviews = await reviewService.getReviewsForCourse(courseId);
            const stats = await reviewService.getAverageRating(courseId);

            return res.status(200).json({
                reviews,
                stats
            });
        } catch (error) {
            console.error("Get Reviews Error:", error);
            return res.status(500).json({ error: "Failed to fetch reviews" });
        }
    };

    deleteReview = async (req, res) => {
        try {
            const { id } = req.params;
            const isAdmin = (req.user.role || "").toLowerCase() === "admin" || req.user.is_super_admin;

            const success = await reviewService.deleteReview(id, req.user.id, isAdmin);
            if (!success) {
                return res.status(403).json({ error: "Not authorized to delete this review" });
            }

            return res.status(204).send();
        } catch (error) {
            console.error("Delete Review Error:", error);
            return res.status(500).json({ error: "Failed to delete review" });
        }
    };
}

export default new ReviewController();
