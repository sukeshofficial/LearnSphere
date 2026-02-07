import React, { useState, useEffect } from "react";
import "../styles/modal.css";

const CreateCourseModal = ({ isOpen, onClose, onSubmit, editingCourse = null }) => {
    const [formData, setFormData] = useState({
        title: "",
        short_description: "",
        tags: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingCourse) {
            setFormData({
                title: editingCourse.title || "",
                short_description: editingCourse.short_description || "",
                tags: (editingCourse.tags || []).join(", "),
            });
        } else {
            setFormData({
                title: "",
                short_description: "",
                tags: "",
            });
        }
    }, [editingCourse, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        setLoading(true);
        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
                visibility: "EVERYONE",
                access_rule: "OPEN",
                price_cents: 0
            };
            await onSubmit(payload);
        } catch (error) {
            console.error("Error submitting course:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">{editingCourse ? "Edit Course" : "Create Course"}</h2>
                    <button className="close-btn" onClick={onClose} disabled={loading}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label" htmlFor="title">Course Name</label>
                            <input
                                id="title"
                                name="title"
                                className="form-input"
                                type="text"
                                placeholder="Provide a name.. (Eg: Basics of Odoo CRM)"
                                value={formData.title}
                                onChange={handleChange}
                                autoFocus
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="short_description">Short Description</label>
                            <textarea
                                id="short_description"
                                name="short_description"
                                className="form-input"
                                placeholder="Briefly describe the course..."
                                value={formData.short_description}
                                onChange={handleChange}
                                rows="3"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="tags">Tags (comma separated)</label>
                            <input
                                id="tags"
                                name="tags"
                                className="form-input"
                                type="text"
                                placeholder="e.g. react, frontend, odoo"
                                value={formData.tags}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading || !formData.title.trim()}>
                            {loading ? "Saving..." : (editingCourse ? "Update" : "Create")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCourseModal;
