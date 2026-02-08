import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import * as coursesApi from "../services/coursesApi";
import * as learnerApi from "../services/learnerApi";
import * as quizApi from "../services/quizApi";
import LessonSidebar from "../components/LessonSidebar";
import ContentArea from "../components/ContentArea";
import QuizPlayer from "../components/QuizPlayer";
import RatingsReviewsTab from "../components/RatingsReviewsTab";
import "../styles/coursePlayer.css";

const CoursePlayerPage = () => {
    const { id: courseId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [activeLesson, setActiveLesson] = useState(null);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchCourseData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Course Details
                const courseRes = await coursesApi.getCourseById(courseId);
                const courseData = courseRes.data.course;
                setCourse(courseData);

                // 2. Check Enrollment
                let enrollment = null;
                const userRole = (user?.role || "").toLowerCase();
                const isPrivileged = userRole === 'admin' || userRole === 'instructor' || user?.is_super_admin;

                if (user) {
                    try {
                        const enrollRes = await learnerApi.getMyEnrollments();
                        const enrollments = enrollRes.data.enrollments || [];
                        enrollment = enrollments.find(e => e.course_id === courseId);
                    } catch (e) {
                        console.warn("Enrollment check failed, assuming not enrolled", e);
                    }
                }

                let enrolledStatus = false;
                if (isPrivileged) {
                    enrolledStatus = true;
                } else if (enrollment && enrollment.status === 'ACTIVE') {
                    // Also consider COMPLETED? Yes.
                    enrolledStatus = true;
                } else if (enrollment && enrollment.status === 'COMPLETED') {
                    enrolledStatus = true;
                }

                setIsEnrolled(enrolledStatus);

                // 3. Fetch Content only if enrolled (or privileged)
                if (enrolledStatus) {
                    // Fetch Lessons
                    const lessonsRes = await coursesApi.getLessonsByCourse(courseId);
                    const lessonData = lessonsRes.data.lessons || [];
                    setLessons(lessonData);

                    // Fetch Quizzes
                    try {
                        const quizzesRes = await quizApi.getQuizzesByCourse(courseId);
                        setQuizzes(quizzesRes.data || []);
                    } catch (qErr) {
                        // ignore
                    }

                    if (lessonData.length > 0) {
                        setActiveLesson(lessonData[0]);
                    }
                }

            } catch (err) {
                console.error("Player Load Error:", err);
                setError("Failed to load course details.");
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchCourseData();
        }
    }, [courseId, user]);

    const handleJoin = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        // Redirect to dashboard or trigger enroll?
        // Simplest is to just go to /courses for now or re-use MyCourses logic
        // For now, let's just go to MyCourses where they can click "Start" which triggers enroll
        // Or call enroll directly?
        try {
            if (course.access_rule === 'PAID') {
                if (window.confirm(`Enroll in ${course.title} for INR ${course.price_cents / 100}?`)) {
                    await learnerApi.purchaseCourse(course.id, { payment_stub: true });
                    window.location.reload();
                }
            } else {
                await learnerApi.enrollInCourse(course.id);
                window.location.reload();
            }
        } catch (e) {
            alert("Enrollment failed");
        }
    };

    if (loading) return <div className="player-loading">Loading...</div>;
    if (error) return <div className="no-access-container"><p>{error}</p></div>;
    if (!course) return <div className="no-access-container"><p>Course not found</p></div>;

    const renderPublicOverview = () => (
        <div className="public-course-details">
            <div className="public-hero">
                {course.image_url && (
                    <img
                        src={`http://localhost:5000${course.image_url}`}
                        alt={course.title}
                        className="public-cover"
                    />
                )}
                <h1 className="public-title">{course.title}</h1>
                <div className="course-tags" style={{ marginBottom: '1rem' }}>
                    {(course.tags || []).map((tag, i) => (
                        <span key={i} className="tag-pill">{tag}</span>
                    ))}
                </div>
            </div>

            <div className="public-actions">
                {course.access_rule === 'PAID' ? (
                    <span className="public-price">INR {course.price_cents / 100}</span>
                ) : (
                    <span className="public-price">Free</span>
                )}
                <button className="join-btn" onClick={handleJoin}>
                    {course.access_rule === 'PAID' ? 'Buy Course' : 'Join Course'}
                </button>
            </div>

            <div className="public-desc-long">
                <h3>About this course</h3>
                <p>{course.long_description || course.short_description || "No description available."}</p>
            </div>
        </div>
    );

    const renderEnrolledPlayer = () => (
        <div className="course-player-container-tabs">
            <LessonSidebar
                lessons={lessons}
                activeLessonId={activeLesson?.id}
                onLessonSelect={(lesson) => {
                    setActiveLesson(lesson);
                    setActiveQuiz(null);
                }}
                quizzes={quizzes}
                activeQuizId={activeQuiz?.id}
                onQuizSelect={(quiz) => {
                    setActiveQuiz(quiz);
                    setActiveLesson(null);
                }}
                courseTitle={course?.title}
                onBackToEditor={user?.role === 'admin' || user?.role === 'instructor' ? () => navigate(`/courses/${courseId}/edit`) : null}
            />
            <main className="player-main-content">
                {activeLesson ? (
                    <ContentArea lesson={activeLesson} />
                ) : activeQuiz ? (
                    <QuizPlayer quizId={activeQuiz.id} />
                ) : (
                    <div className="no-content-selected">Select a lesson or quiz to start</div>
                )}
            </main>
        </div>
    );

    return (
        <div className="course-detail-page">
            <div className="course-header-tabs">
                <button
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Course Content
                </button>
                <button
                    className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    Ratings & Reviews
                </button>
            </div>

            <div className="course-detail-content">
                {activeTab === 'overview' && (
                    isEnrolled ? renderEnrolledPlayer() : renderPublicOverview()
                )}

                {activeTab === 'reviews' && (
                    <RatingsReviewsTab courseId={courseId} />
                )}
            </div>
        </div>
    );
};

export default CoursePlayerPage;
