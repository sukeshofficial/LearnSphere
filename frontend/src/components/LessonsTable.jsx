import React, { useState } from "react";

const LessonsTable = ({ lessons, onEdit, onDelete }) => {
    const [openMenuId, setOpenMenuId] = useState(null);

    const toggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    return (
        <div className="lesson-table-container">
            <table className="lesson-table">
                <thead>
                    <tr>
                        <th>Content Title</th>
                        <th>Category</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {lessons.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="no-lessons">
                                No content added yet. Click "Add Content" to start.
                            </td>
                        </tr>
                    ) : (
                        lessons.map((lesson) => (
                            <tr key={lesson.id} className="lesson-row">
                                <td>{lesson.title}</td>
                                <td>{lesson.type}</td>
                                <td className="actions-cell">
                                    <div className="three-dot-menu">
                                        <button className="dots-btn" onClick={() => toggleMenu(lesson.id)}>⋮</button>
                                        {openMenuId === lesson.id && (
                                            <div className="dropdown-menu">
                                                <button
                                                    className="dropdown-item"
                                                    onClick={() => { onEdit(lesson); setOpenMenuId(null); }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="dropdown-item delete"
                                                    onClick={() => { onDelete(lesson.id); setOpenMenuId(null); }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default LessonsTable;
