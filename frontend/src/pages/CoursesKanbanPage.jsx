import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import ViewToggle from "../components/ViewToggle";
import CourseCard from "../components/CourseCard";
import CreateCourseModal from "../components/CreateCourseModal";
import * as coursesApi from "../services/coursesApi";
import "../styles/coursesKanban.css";

const CoursesKanbanPage = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState("kanban");
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await coursesApi.getCourses();
            setCourses(response.data.items || []);
            setError(null);
        } catch (err) {
            console.error("Error fetching courses:", err);
            setError("Failed to load courses.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (courseData) => {
        try {
            if (editingCourse) {
                await coursesApi.updateCourse(editingCourse.id, courseData);
            } else {
                await coursesApi.createCourse(courseData);
            }
            setIsModalOpen(false);
            setEditingCourse(null);
            fetchCourses();
        } catch (err) {
            console.error("Error saving course:", err);
            alert("Failed to save course. Please check your data.");
        }
    };

    const handleDeleteCourse = async (id) => {
        if (window.confirm("Are you sure you want to delete this course?")) {
            try {
                await coursesApi.deleteCourse(id);
                fetchCourses();
            } catch (err) {
                console.error("Error deleting course:", err);
                alert("Failed to delete course.");
            }
        }
    };

    const openEditModal = (course) => {
        navigate(`/courses/${course.id}/edit`);
    };

    // Client-side filtering for real-time search
    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="courses-kanban-container">
            <div className="kanban-header">
                <h1>Courses</h1>
            </div>

            <div className="controls-row">
                <SearchBar onSearch={setSearchQuery} />
                <ViewToggle view={view} onViewChange={setView} />
            </div>

            {loading && <div className="loading-state">Loading courses...</div>}
            {error && <div className="error-state">{error}</div>}

            {!loading && !error && (
                <>
                    {filteredCourses.length === 0 ? (
                        <div className="no-results">No courses found.</div>
                    ) : (
                        <div className={view === "kanban" ? "courses-grid" : "courses-list"}>
                            {filteredCourses.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    view={view}
                                    onEdit={openEditModal}
                                    onDelete={handleDeleteCourse}
                                    onStatusChange={fetchCourses}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            <button
                className="add-course-fab"
                onClick={() => {
                    setEditingCourse(null);
                    setIsModalOpen(true);
                }}
                title="Create New Course"
            >
                +
            </button>

            <CreateCourseModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingCourse(null);
                }}
                onSubmit={handleCreateOrUpdate}
                editingCourse={editingCourse}
            />
        </div>
    );
};

export default CoursesKanbanPage;
