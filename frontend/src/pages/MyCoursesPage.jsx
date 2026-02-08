import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import * as coursesApi from "../services/coursesApi";
import * as learnerApi from "../services/learnerApi";
import SearchBar from "../components/SearchBar";
import LearnerCourseCard from "../components/LearnerCourseCard";
import ProfilePointsPanel from "../components/ProfilePointsPanel";
import "../styles/myCourses.css";

const MyCoursesPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchData = async (query = "") => {
        setLoading(true);
        try {
            const params = query ? { q: query } : {};
            const coursesRes = await coursesApi.getCourses(params);
            let courseItems = coursesRes.data.items || [];

            if (user) {
                // Safeguard course loading: Fetch enrollments separately from stats.
                // One failing API call (like stats 404) must not block the entire feature.
                try {
                    const enrollRes = await learnerApi.getMyEnrollments();
                    const enrollMap = (enrollRes.data.enrollments || []).reduce((acc, e) => {
                        acc[e.course_id] = e;
                        return acc;
                    }, {});

                    courseItems = courseItems.map(c => ({
                        ...c,
                        user_enrollment_status: enrollMap[c.id]?.status || null,
                        progress_percent: 0
                    }));
                } catch (enrollErr) {
                    console.error("Error fetching enrollments:", enrollErr);
                }

                try {
                    // stats API is guarded with try/catch and fallback values because
                    // it may not be implemented on the backend yet (GET /api/progress/users/me/stats -> 404).
                    const statsRes = await learnerApi.getLearnerStats();
                    setStats(statsRes.data);
                } catch (statsErr) {
                    console.warn("Stats API failed, using fallback:", statsErr.message);
                    setStats({
                        total_points: 0,
                        current_badge: "Newbie"
                    });
                }
            }

            setCourses(courseItems);
        } catch (err) {
            console.error("Error fetching courses:", err);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch on mount or user change
    useEffect(() => {
        fetchData("");
    }, [user]);

    // Debounced search fetch
    useEffect(() => {
        if (searchQuery === "") {
            // If search is cleared, we might want to reset to all courses
            // but the [user] effect already handles fetchData("")
            // However, to ensure it updates when user types back to empty:
            fetchData("");
            return;
        }

        const timer = setTimeout(() => {
            fetchData(searchQuery);
        }, 600);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleAction = async (action, course) => {
        if (action === "login") {
            navigate("/login");
            return;
        }

        if (action === "buy") {
            if (window.confirm(`Enroll in ${course.title} for INR ${course.price_cents / 100}?`)) {
                try {
                    await learnerApi.purchaseCourse(course.id, { payment_stub: true });
                    alert("Course purchased successfully!");
                    fetchData(searchQuery);
                } catch (err) {
                    alert("Purchase failed.");
                }
            }
            return;
        }

        if (action === "enroll" || action === "start") {
            try {
                // If the user isn't strictly ACTIVE yet, call enrollment
                if (course.user_enrollment_status !== 'ACTIVE') {
                    await learnerApi.enrollInCourse(course.id);
                }
                navigate(`/courses/${course.id}`);
            } catch (err) {
                console.error("Enrollment error:", err);
                alert("Failed to start course. Please try again.");
            }
            return;
        }

        if (action === "continue") {
            navigate(`/courses/${course.id}`);
        }
    };

    if (loading && courses.length === 0) return <div className="loading-container">Loading your dashboard...</div>;

    return (
        <div className="my-courses-layout">
            <main className="main-content">
                <header className="page-header">
                    <h1>My Courses</h1>
                    <div className="search-wrapper">
                        <SearchBar onSearch={setSearchQuery} />
                    </div>
                </header>

                <div className="course-grid">
                    {courses.length > 0 ? (
                        courses.map(course => (
                            <LearnerCourseCard
                                key={course.id}
                                course={course}
                                user={user}
                                onAction={handleAction}
                            />
                        ))
                    ) : (
                        <div className="no-results">
                            <h3>No courses found</h3>
                            <p>Try searching with a different title or keyword.</p>
                        </div>
                    )}
                </div>
            </main>

            {user && (
                <ProfilePointsPanel stats={stats} />
            )}
        </div>
    );
};

export default MyCoursesPage;
