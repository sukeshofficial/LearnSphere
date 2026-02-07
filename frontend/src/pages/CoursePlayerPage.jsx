import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import * as coursesApi from "../services/coursesApi";
import * as learnerApi from "../services/learnerApi";
import LessonSidebar from "../components/LessonSidebar";
import ContentArea from "../components/ContentArea";
import "../styles/coursePlayer.css";

const CoursePlayerPage = () => {
    const { id: courseId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [activeLesson, setActiveLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        const fetchCourseData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Course Details
                const courseRes = await coursesApi.getCourseById(courseId);
                const courseData = courseRes.data.course;
                setCourse(courseData);

                // 2. Check Enrollment
                const enrollRes = await learnerApi.getMyEnrollments();
                const enrollments = enrollRes.data.enrollments || [];
                const enrollment = enrollments.find(e => e.course_id === courseId);

                if (!enrollment || enrollment.status === 'INVITED') {
                    setIsEnrolled(false);
                    setLoading(false);
                    return;
                }
                setIsEnrolled(true);

                // 3. Fetch Lessons
                // Note: The lesson.routes.js shows router.get("/courses/:courseId/lessons")
                // but we need to check if the prefix is /api/courses or just /api
                // From server.js: app.use("/api", lessonRoutes);
                // So it should be api.get(`/api/courses/${courseId}/lessons`)
                const lessonsRes = await coursesApi.getLessonsByCourse(courseId);
                const lessonData = lessonsRes.data.lessons || [];
                setLessons(lessonData);

                if (lessonData.length > 0) {
                    setActiveLesson(lessonData[0]);
                }
            } catch (err) {
                console.error("Player Load Error:", err);
                setError("Failed to load course details.");
            } finally {
                setLoading(false);
            }
        };

        if (user && courseId) {
            fetchCourseData();
        } else if (!user) {
            navigate("/login");
        }
    }, [courseId, user, navigate]);

    if (loading) return <div className="player-loading">Loading Course Player...</div>;

    if (!isEnrolled) {
        return (
            <div className="no-access-container">
                <h2>Access Denied</h2>
                <p>You need to be enrolled in this course to view the lessons.</p>
                <Link to="/courses" className="back-btn">Browse Courses</Link>
            </div>
        );
    }

    if (error) {
        return (
            <div className="no-access-container">
                <h2>Error</h2>
                <p>{error}</p>
                <Link to="/courses" className="back-btn">Back to Courses</Link>
            </div>
        );
    }

    return (
        <div className="course-player-container">
            <LessonSidebar
                lessons={lessons}
                activeLessonId={activeLesson?.id}
                onLessonSelect={setActiveLesson}
                courseTitle={course?.title}
            />
            <main className="player-main-content">
                <ContentArea lesson={activeLesson} />
            </main>
        </div>
    );
};

export default CoursePlayerPage;
