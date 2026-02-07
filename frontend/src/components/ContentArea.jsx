import React from "react";
import "../styles/contentArea.css";

const ContentArea = ({ lesson }) => {
    if (!lesson) return <div className="no-lesson-selected">Select a lesson to start learning</div>;

    const renderContent = () => {
        const fileUrl = lesson.content_url ? `http://localhost:5000${lesson.content_url}` : null;

        switch (lesson.type) {
            case 'VIDEO':
                return (
                    <div className="video-container">
                        {fileUrl ? (
                            <video controls key={fileUrl}>
                                <source src={fileUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <div className="no-file-placeholder">Video URL missing</div>
                        )}
                    </div>
                );
            case 'DOCUMENT':
                return (
                    <div className="document-container">
                        {fileUrl ? (
                            <iframe
                                src={fileUrl}
                                className="doc-frame"
                                title={lesson.title}
                                key={fileUrl}
                            />
                        ) : (
                            <div className="no-file-placeholder">Document URL missing</div>
                        )}
                    </div>
                );
            case 'IMAGE':
                return (
                    <div className="document-container">
                        {fileUrl ? (
                            <img src={fileUrl} alt={lesson.title} className="image-viewer" />
                        ) : (
                            <div className="no-file-placeholder">Image URL missing</div>
                        )}
                    </div>
                );
            default:
                return (
                    <div className="content-description">
                        <p>{lesson.description || "No content available for this lesson."}</p>
                    </div>
                );
        }
    };

    return (
        <div className="content-viewer">
            <div className="content-header">
                <h1>{lesson.title}</h1>
            </div>

            {renderContent()}

            {lesson.description && (
                <div className="content-description">
                    <h3>About this lesson</h3>
                    <p>{lesson.description}</p>
                </div>
            )}
        </div>
    );
};

export default ContentArea;
