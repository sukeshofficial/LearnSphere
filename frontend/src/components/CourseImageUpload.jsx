import { useRef, useState, useEffect } from "react";
import "../styles/course-image-upload.css";

export default function CourseImageUpload({ initialImage, onFileSelect }) {
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (initialImage) {
            setPreview(initialImage);
        }
    }, [initialImage]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPreview(URL.createObjectURL(file));

        if (typeof onFileSelect === "function") {
            onFileSelect(file);
        }
    };

    return (
        <div className="course-image-upload-wrapper">
            <label className="course-image-upload">
                {preview ? (
                    <img src={preview} alt="Course preview" className="course-image-preview" />
                ) : (
                    <div className="course-image-placeholder">
                        <span className="upload-icon">📷</span>
                        <span className="upload-text">Course Image</span>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </label>
            <p className="upload-hint">Recommended size: 1200x675 (16:9)</p>
        </div>
    );
}
