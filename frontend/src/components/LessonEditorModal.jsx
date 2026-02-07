import React, { useState, useEffect } from "react";
import FileUploadField from "./FileUploadField";
import * as lessonsApi from "../services/lessonsApi";
import "../styles/lessonModal.css";
import "../styles/lessonTabs.css";
import "../styles/upload.css";

const LessonEditorModal = ({ isOpen, onClose, courseId, editingLesson, onSave }) => {
    const [activeTab, setActiveTab] = useState("content");
    const [formData, setFormData] = useState({
        title: "",
        type: "VIDEO",
        content_url: "",
        duration_seconds: 0,
        allow_download: false,
        description: "",
        responsible_id: ""
    });
    const [attachments, setAttachments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (editingLesson) {
            setFormData({
                title: editingLesson.title || "",
                type: editingLesson.type || "VIDEO",
                content_url: editingLesson.content_url || "",
                duration_seconds: editingLesson.duration_seconds || 0,
                allow_download: editingLesson.allow_download || false,
                description: editingLesson.description || "",
                responsible_id: editingLesson.created_by || ""
            });
            fetchAttachments(editingLesson.id);
        } else {
            setFormData({
                title: "",
                type: "VIDEO",
                content_url: "",
                duration_seconds: 0,
                allow_download: false,
                description: "",
                responsible_id: ""
            });
            setAttachments([]);
        }
        setActiveTab("content");
    }, [editingLesson, isOpen]);

    const fetchAttachments = async (lessonId) => {
        try {
            const resp = await lessonsApi.getLessonsByCourse(courseId); // Simplified, usually dedicated endpoint
            // Assuming attachments are part of lesson or separate fetch
        } catch (err) {
            console.error("Error fetching attachments:", err);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (fileData) => {
        setFormData(prev => ({ ...prev, content_url: fileData.file_url }));
    };

    const handleAddAttachment = async (fileData) => {
        if (!editingLesson) {
            // For new lessons, keep local state and save after lesson creation
            setAttachments(prev => [...prev, fileData]);
        } else {
            // For existing lessons, save immediately
            try {
                const resp = await lessonsApi.addAttachment(editingLesson.id, {
                    title: fileData.filename,
                    file_url: fileData.file_url,
                    file_size: fileData.size,
                    file_type: fileData.type
                });
                setAttachments(prev => [...prev, resp.data]);
            } catch (err) {
                console.error("Failed to add attachment:", err);
            }
        }
    };

    const handleRemoveAttachment = async (index, attId) => {
        if (attId) {
            try {
                await lessonsApi.deleteAttachment(attId);
            } catch (err) {
                console.error("Delete attachment failed:", err);
            }
        }
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!formData.title) return alert("Title is required");
        setIsSubmitting(true);
        try {
            let savedLesson;
            if (editingLesson) {
                const resp = await lessonsApi.updateLesson(editingLesson.id, formData);
                savedLesson = resp.data;
            } else {
                const resp = await lessonsApi.createLesson(courseId, formData);
                savedLesson = resp.data;
                // Handle local attachments for new lesson
                for (const att of attachments) {
                    await lessonsApi.addAttachment(savedLesson.id, {
                        title: att.filename,
                        file_url: att.file_url,
                        file_size: att.size,
                        file_type: att.type
                    });
                }
            }
            onSave();
            onClose();
        } catch (err) {
            console.error("Save lesson failed:", err);
            alert("Failed to save. Please check your inputs.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="lesson-modal-overlay" onClick={onClose}>
            <div className="lesson-modal-container" onClick={e => e.stopPropagation()}>
                <div className="lesson-modal-header">
                    <div>
                        <div className="field-label" style={{ color: '#f59e0b' }}>Content title</div>
                        <div className="content-title-display">{formData.title || "Untitled Lesson"}</div>
                    </div>
                    <button className="close-modal-btn" onClick={onClose}>×</button>
                </div>

                <div className="lesson-tabs-container">
                    <button
                        className={`lesson-tab-item ${activeTab === "content" ? "active" : ""}`}
                        onClick={() => setActiveTab("content")}
                    >
                        Content
                    </button>
                    <button
                        className={`lesson-tab-item ${activeTab === "description" ? "active" : ""}`}
                        onClick={() => setActiveTab("description")}
                    >
                        Description
                    </button>
                    <button
                        className={`lesson-tab-item ${activeTab === "attachment" ? "active" : ""}`}
                        onClick={() => setActiveTab("attachment")}
                    >
                        Additional attachment
                    </button>
                </div>

                <div className="lesson-modal-body">
                    {activeTab === "content" && (
                        <div className="form-field-group">
                            <div className="form-group">
                                <label className="field-label">Lesson Title</label>
                                <input
                                    type="text"
                                    className="text-input"
                                    value={formData.title}
                                    onChange={e => handleInputChange("title", e.target.value)}
                                    placeholder="e.g. Advanced Sales & CRM Automation"
                                />
                            </div>

                            <div className="category-row">
                                <span className="field-label" style={{ margin: 0 }}>Content Category :</span>
                                {["VIDEO", "DOCUMENT", "IMAGE"].map(cat => (
                                    <label key={cat} className="category-option">
                                        <input
                                            type="radio"
                                            className="category-radio"
                                            name="category"
                                            checked={formData.type === cat}
                                            onChange={() => handleInputChange("type", cat)}
                                        />
                                        {cat.charAt(0) + cat.slice(1).toLowerCase()}
                                    </label>
                                ))}
                            </div>

                            {formData.type === "VIDEO" && (
                                <div className="dynamic-fields-row">
                                    <div className="form-group">
                                        <label className="field-label">Video Link</label>
                                        <input
                                            type="text"
                                            className="text-input"
                                            value={formData.content_url}
                                            onChange={e => handleInputChange("content_url", e.target.value)}
                                            placeholder="YouTube / Google Drive URL"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="field-label">Duration (Seconds)</label>
                                        <input
                                            type="number"
                                            className="text-input"
                                            value={formData.duration_seconds}
                                            onChange={e => handleInputChange("duration_seconds", parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>
                            )}

                            {(formData.type === "DOCUMENT" || formData.type === "IMAGE") && (
                                <div className="dynamic-fields-row">
                                    <FileUploadField
                                        label={`${formData.type.charAt(0) + formData.type.slice(1).toLowerCase()} file :`}
                                        value={formData.content_url}
                                        onChange={handleFileChange}
                                        accept={formData.type === "IMAGE" ? "image/*" : ".pdf,.doc,.docx"}
                                    />
                                    <div className="allow-download-row" style={{ paddingBottom: '1rem' }}>
                                        <span className="field-label" style={{ margin: 0 }}>Allow Download :</span>
                                        <input
                                            type="checkbox"
                                            className="checkbox-toggle"
                                            checked={formData.allow_download}
                                            onChange={e => handleInputChange("allow_download", e.target.checked)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="field-label">Responsible :</label>
                                <select
                                    className="select-input"
                                    value={formData.responsible_id}
                                    onChange={e => handleInputChange("responsible_id", e.target.value)}
                                >
                                    <option value="">Select Responsible</option>
                                    <option value="current">Current User</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {activeTab === "description" && (
                        <div className="form-field-group">
                            <label className="field-label">Lesson Description</label>
                            <textarea
                                className="textarea-input"
                                rows="10"
                                value={formData.description}
                                onChange={e => handleInputChange("description", e.target.value)}
                                placeholder="Details about this lesson..."
                            ></textarea>
                        </div>
                    )}

                    {activeTab === "attachment" && (
                        <div className="form-field-group">
                            <div className="attachments-list">
                                {attachments.map((att, index) => (
                                    <div key={index} className="attachment-item">
                                        <div className="attachment-info">
                                            <span>📄</span>
                                            <span>{att.id ? att.title : att.filename}</span>
                                        </div>
                                        <button
                                            className="remove-attachment-btn"
                                            onClick={() => handleRemoveAttachment(index, att.id)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                {attachments.length === 0 && <div className="no-lessons">No additional attachments yet.</div>}
                            </div>

                            <FileUploadField
                                label="Add new attachment :"
                                onChange={handleAddAttachment}
                                accept=".pdf,.doc,.docx,.zip,.jpg,.png"
                            />
                        </div>
                    )}
                </div>

                <div className="lesson-modal-footer">
                    <button className="modal-btn secondary" onClick={onClose}>Cancel</button>
                    <button
                        className="modal-btn primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : editingLesson ? "Save Changes" : "Save Lesson"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LessonEditorModal;
