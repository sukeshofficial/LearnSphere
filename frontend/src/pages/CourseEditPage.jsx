import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CourseHeaderActions from "../components/CourseHeaderActions";
import CourseTabs from "../components/CourseTabs";
import LessonsTable from "../components/LessonsTable";
import LessonModal from "../components/LessonModal";
import * as coursesApi from "../services/coursesApi";
import * as lessonsApi from "../services/lessonsApi";
import * as quizApi from "../services/reportingApi"; // Using reportingApi for now or create specialized
import api from "../api/api";
import "../styles/courseForm.css";
import "../styles/tabs.css";
import "../styles/headerActions.css";
import "../styles/lessonTable.css";
import "../styles/modal.css";

const CourseEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [activeTab, setActiveTab] = useState("content");
    const [loading, setLoading] = useState(true);
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);

    useEffect(() => {
        if (id && id !== 'new') {
            fetchCourseData();
            fetchLessons();
            fetchQuizzes();
        } else {
            setCourse({
                title: "",
                tags: [],
                visibility: "EVERYONE",
                access_rule: "OPEN",
                price_cents: 0,
                is_published: false,
                long_description: ""
            });
            setLoading(false);
        }
    }, [id]);

    const fetchCourseData = async () => {
        try {
            const response = await coursesApi.getCourseById(id);
            setCourse(response.data.course || response.data);
        } catch (err) {
            console.error("Error fetching course:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLessons = async () => {
        try {
            const response = await lessonsApi.getLessonsByCourse(id);
            setLessons(response.data || []);
        } catch (err) {
            console.error("Error fetching lessons:", err);
        }
    };

    const fetchQuizzes = async () => {
        try {
            const response = await api.get(`/api/courses/${id}/quizzes`);
            setQuizzes(response.data || []);
        } catch (err) {
            console.error("Error fetching quizzes:", err);
        }
    };

    const handleSaveCourse = async () => {
        if (!course.title) return;
        try {
            if (id && id !== 'new') {
                await coursesApi.updateCourse(id, course);
            } else {
                const response = await coursesApi.createCourse(course);
                const newId = response.data.id;
                navigate(`/courses/${newId}/edit`, { replace: true });
            }
        } catch (err) {
            console.error("Error saving course:", err);
        }
    };

    const handlePublishToggle = async (isPublished) => {
        try {
            await coursesApi.publishCourse(id, isPublished);
            setCourse({ ...course, is_published: isPublished });
        } catch (err) {
            console.error("Error toggling publish:", err);
        }
    };

    const handleLessonSubmit = async (lessonData) => {
        try {
            if (editingLesson) {
                await lessonsApi.updateLesson(editingLesson.id, lessonData);
            } else {
                await lessonsApi.createLesson({ ...lessonData, course_id: id });
            }
            setIsLessonModalOpen(false);
            setEditingLesson(null);
            fetchLessons();
        } catch (err) {
            console.error("Error saving lesson:", err);
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (window.confirm("Are you sure you want to delete this content?")) {
            try {
                await lessonsApi.deleteLesson(lessonId);
                fetchLessons();
            } catch (err) {
                console.error("Error deleting lesson:", err);
            }
        }
    };

    if (loading || !course) return <div className="loading-state">Loading course configuration...</div>;

    return (
        <div className="course-form-container">
            <CourseHeaderActions
                isPublished={course.is_published}
                onPublishToggle={handlePublishToggle}
                onPreview={() => window.open(`/courses/${id}`, '_blank')}
                onNew={() => navigate('/courses/new')}
                onInvite={() => alert("Add Attendees logic pending")}
                onContact={() => alert("Contact Attendees logic pending")}
            />

            <div className="course-main-fields">
                <div className="fields-column">
                    <div className="form-group">
                        <label>Course Title</label>
                        <input
                            type="text"
                            className="course-title-input"
                            value={course.title}
                            onChange={(e) => setCourse({ ...course, title: e.target.value })}
                            onBlur={handleSaveCourse}
                        />
                    </div>
                    <div className="form-group">
                        <label>Tags (Comma separated)</label>
                        <input
                            type="text"
                            value={Array.isArray(course.tags) ? course.tags.join(', ') : course.tags}
                            onChange={(e) => setCourse({ ...course, tags: e.target.value.split(',').map(t => t.trim()) })}
                            onBlur={handleSaveCourse}
                        />
                    </div>
                    <div className="form-group">
                        <label>Responsible</label>
                        <select
                            value={course.created_by}
                            onChange={(e) => setCourse({ ...course, created_by: e.target.value })}
                            onBlur={handleSaveCourse}
                        >
                            <option value={course.created_by}>Current Responsible</option>
                        </select>
                    </div>
                </div>

                <div className="image-column">
                    <div className="image-upload-box">
                        {course.image_url ? (
                            <img src={course.image_url} alt="Course" className="image-preview" />
                        ) : (
                            <>
                                <span className="upload-icon">📷</span>
                                <span className="upload-text">Course Image</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-2rem">
                <CourseTabs activeTab={activeTab} onTabChange={setActiveTab} />

                <div className="tab-content">
                    {activeTab === "content" && (
                        <div className="lesson-table-container">
                            <LessonsTable
                                lessons={lessons}
                                onEdit={(lesson) => { setEditingLesson(lesson); setIsLessonModalOpen(true); }}
                                onDelete={handleDeleteLesson}
                            />
                            <button
                                className="add-content-btn"
                                onClick={() => { setEditingLesson(null); setIsLessonModalOpen(true); }}
                            >
                                Add Content
                            </button>
                        </div>
                    )}

                    {activeTab === "description" && (
                        <div className="form-group">
                            <label>Course Long Description</label>
                            <textarea
                                rows="15"
                                className="course-description-area"
                                value={course.long_description || ""}
                                onChange={(e) => setCourse({ ...course, long_description: e.target.value })}
                                onBlur={handleSaveCourse}
                                placeholder="Enter detailed course information..."
                            ></textarea>
                        </div>
                    )}

                    {activeTab === "options" && (
                        <div className="options-grid">
                            <div className="form-group">
                                <label>Visibility</label>
                                <select
                                    value={course.visibility}
                                    onChange={(e) => setCourse({ ...course, visibility: e.target.value })}
                                    onBlur={handleSaveCourse}
                                >
                                    <option value="EVERYONE">Everyone</option>
                                    <option value="SIGNED_IN">Signed In Users</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Access Rule</label>
                                <select
                                    value={course.access_rule}
                                    onChange={(e) => setCourse({ ...course, access_rule: e.target.value })}
                                    onBlur={handleSaveCourse}
                                >
                                    <option value="OPEN">Open</option>
                                    <option value="INVITE_ONLY">Invite Only</option>
                                    <option value="PAYMENT">Payment Required</option>
                                </select>
                            </div>
                            {course.access_rule === "PAYMENT" && (
                                <div className="form-group">
                                    <label>Price (Cents)</label>
                                    <input
                                        type="number"
                                        value={course.price_cents}
                                        onChange={(e) => setCourse({ ...course, price_cents: e.target.value })}
                                        onBlur={handleSaveCourse}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "quiz" && (
                        <div className="quiz-list">
                            <h3>Course Quizzes</h3>
                            <table className="lesson-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Created At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quizzes.length === 0 ? (
                                        <tr><td colSpan="2">No quizzes found for this course.</td></tr>
                                    ) : (
                                        quizzes.map(quiz => (
                                            <tr key={quiz.id}>
                                                <td>{quiz.title}</td>
                                                <td>{new Date(quiz.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <LessonModal
                isOpen={isLessonModalOpen}
                editingLesson={editingLesson}
                onClose={() => setIsLessonModalOpen(false)}
                onSubmit={handleLessonSubmit}
            />
        </div>
    );
};

export default CourseEditPage;
