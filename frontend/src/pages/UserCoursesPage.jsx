import React, { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import * as coursesApi from "../services/coursesApi";
import UserCourseCard from "../components/UserCourseCard";
import SearchBar from "../components/SearchBar";
import "../styles/userCourses.css";
// Importing assets for toast icons - assuming they exist as they are used in Profile.jsx
import tickIcon from "../assets/check-small.svg";
import failIcon from "../assets/fail-small.svg";

const UserCoursesPage = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null); // Toast state

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await coursesApi.getCourses();
            const publishedCourses = (response.data.items || []).filter(c => c.is_published);
            setCourses(publishedCourses);
            setError(null);
        } catch (err) {
            console.error("Error fetching courses:", err);
            setError("Failed to load courses.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const showToast = (type, text) => {
        setToast({ type, text });
        setTimeout(() => setToast(null), 3000);
    };

    const handleEnrollmentResult = (success, message, courseId) => {
        if (success) {
            showToast("success", message || "Successfully enrolled!");
            // Optimistically update the course state to "enrolled"
            setCourses(prevCourses =>
                prevCourses.map(course =>
                    course.id === courseId ? { ...course, is_enrolled: true } : course
                )
            );
            // Optionally fetch again to ensure consistency, but optimistic update handles the UI check
            // fetchCourses(); 
        } else {
            showToast("error", message || "Enrollment failed.");
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="user-courses-container">
            <div className="user-courses-header">
                <h1>My Courses</h1>
                <div className="search-wrapper">
                    <SearchBar onSearch={setSearchQuery} />
                </div>
            </div>

            {loading && <div className="loading-state">Loading courses...</div>}
            {error && <div className="error-state">{error}</div>}

            {!loading && !error && (
                <>
                    {filteredCourses.length === 0 ? (
                        <div className="empty-state">
                            <h3>No courses found</h3>
                            <p>Try adjusting your search terms.</p>
                        </div>
                    ) : (
                        <div className="user-courses-grid">
                            {filteredCourses.map(course => (
                                <UserCourseCard
                                    key={course.id}
                                    course={course}
                                    user={user}
                                    onEnrollmentResult={handleEnrollmentResult}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className={`toast glass toast-${toast.type}`}>
                    {toast.type === "success" && (
                        <img src={tickIcon} alt="Success" className="toast-icon" />
                    )}
                    {toast.type === "error" && (
                        <img src={failIcon} alt="Failure" className="toast-icon" />
                    )}
                    <span>{toast.text}</span>
                </div>
            )}
        </div>
    );
};

export default UserCoursesPage;
