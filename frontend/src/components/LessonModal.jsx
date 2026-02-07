import React, { useState, useEffect } from "react";

const LessonModal = ({ isOpen, onClose, onSubmit, editingLesson }) => {
    const [formData, setFormData] = useState({
        title: "",
        type: "VIDEO",
        content_url: "",
        description: "",
        duration_seconds: 0
    });

    useEffect(() => {
        if (editingLesson) {
            setFormData({
                title: editingLesson.title || "",
                type: editingLesson.type || "VIDEO",
                content_url: editingLesson.content_url || "",
                description: editingLesson.description || "",
                duration_seconds: editingLesson.duration_seconds || 0
            });
        } else {
            setFormData({
                title: "",
                type: "VIDEO",
                content_url: "",
                description: "",
                duration_seconds: 0
            });
        }
    }, [editingLesson, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{editingLesson ? "Edit Content" : "Add Content"}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Introduction to Odoo"
                        />
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label>Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="VIDEO">Video</option>
                            <option value="DOCUMENT">Document</option>
                            <option value="IMAGE">Image</option>
                            <option value="QUIZ">Quiz</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label>URL / Link</label>
                        <input
                            type="text"
                            value={formData.content_url}
                            onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label>Description</label>
                        <textarea
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="modal-btn secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="modal-btn primary">
                            {editingLesson ? "Save Changes" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LessonModal;
