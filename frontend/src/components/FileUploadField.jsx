import React, { useRef } from "react";
import api from "../api/api";
import "../styles/upload.css";

const FileUploadField = ({ label, value, onChange, accept }) => {
    const fileInputRef = useRef(null);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await api.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            onChange({
                file_url: response.data.url,
                filename: response.data.filename,
                size: response.data.size,
                type: response.data.mimetype
            });
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. Please try again.");
        }
    };

    return (
        <div className="form-group">
            <label className="field-label">{label}</label>
            <div className="upload-field-container">
                <div className="upload-input-display">
                    {value || "No file selected"}
                </div>
                <button
                    type="button"
                    className="upload-button-trigger"
                    onClick={() => fileInputRef.current.click()}
                >
                    {value ? "Change file" : "Upload file"}
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept={accept}
                    onChange={handleUpload}
                />
            </div>
        </div>
    );
};

export default FileUploadField;
