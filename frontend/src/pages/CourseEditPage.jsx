import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CourseHeaderActions from "../components/CourseHeaderActions";
import CourseTabs from "../components/CourseTabs";
import LessonsTable from "../components/LessonsTable";
import LessonEditorModal from "../components/LessonEditorModal";
import * as coursesApi from "../services/coursesApi";
import * as lessonsApi from "../services/lessonsApi";
import api from "../api/api";
import "../styles/courseForm.css";
import "../styles/tabs.css";

const CourseEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [activeTab, setActiveTab] = useState("content");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);

    useEffect(() => {
        if (id && id !== 'new') {
            fetchCourseData();
            fetchLessons();
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
            const resp = await coursesApi.getCourseById(id);
            setCourse(resp.data.course || resp.data);
        } catch (err) {
            console.error("Fetch course error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLessons = async () => {
        try {
            const resp = await lessonsApi.getLessonsByCourse(id);
            setLessons(resp.data.lessons || []);
        } catch (err) {
            console.error("Fetch lessons error:", err);
        }
    };

    const handleSaveCourse = async () => {
        if (!course.title) return;
        try {
            if (id && id !== 'new') {
                await coursesApi.updateCourse(id, course);
            } else {
                const resp = await coursesApi.createCourse(course);
                navigate(`/courses/${resp.data.id}/edit`, { replace: true });
            }
        } catch (err) {
            console.error("Save course error:", err);
        }
    };

    const handlePublishToggle = async (is_published) => {
        try {
            await coursesApi.publishCourse(id, is_published);
            setCourse(prev => ({ ...prev, is_published }));
        } catch (err) {
            console.error("Publish toggle error:", err);
        }
    };

    if (loading || !course) return <div className="loading-state">Loading...</div>;

    return (
        <div className="course-form-container">
            <CourseHeaderActions
                isPublished={course.is_published}
                onPublishToggle={handlePublishToggle}
                onPreview={() => window.open(`/courses/${id}`, '_blank')}
                onNew={() => navigate('/courses/new')}
                onInvite={() => alert("Invite logic here")}
                onContact={() => alert("Contact logic here")}
            />

            <div className="course-main-fields">
                <div className="fields-column">
                    <div className="form-group">
                        <label className="field-label">Course Title</label>
                        <input
                            type="text"
                            className="text-input course-title-input"
                            value={course.title}
                            onChange={e => setCourse({ ...course, title: e.target.value })}
                            onBlur={handleSaveCourse}
                        />
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

            <div className="mt-2">
                <CourseTabs activeTab={activeTab} onTabChange={setActiveTab} />

                <div className="tab-content">
                    {activeTab === "content" && (
                        <div>
                            <LessonsTable
                                lessons={lessons}
                                onEdit={(lesson) => { setEditingLesson(lesson); setIsModalOpen(true); }}
                                onDelete={async (lessonId) => {
                                    if (window.confirm("Delete content?")) {
                                        await lessonsApi.deleteLesson(lessonId);
                                        fetchLessons();
                                    }
                                }}
                            />
                            <button
                                className="add-content-btn"
                                onClick={() => { setEditingLesson(null); setIsModalOpen(true); }}
                            >
                                + Add Content
                            </button>
                        </div>
                    )}

                    {activeTab === "description" && (
                        <textarea
                            className="course-description-area"
                            value={course.long_description || ""}
                            onChange={e => setCourse({ ...course, long_description: e.target.value })}
                            onBlur={handleSaveCourse}
                        />
                    )}

                    {activeTab === "options" && (
                        <div className="options-grid">
                            <div className="form-group">
                                <label className="field-label">Visibility</label>
                                <select
                                    className="select-input"
                                    value={course.visibility}
                                    onChange={e => setCourse({ ...course, visibility: e.target.value })}
                                    onBlur={handleSaveCourse}
                                >
                                    <option value="EVERYONE">Everyone</option>
                                    <option value="SIGNED_IN">Signed In</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <LessonEditorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                courseId={id}
                editingLesson={editingLesson}
                onSave={fetchLessons}
            />
        </div>
    );
};

export default CourseEditPage;
