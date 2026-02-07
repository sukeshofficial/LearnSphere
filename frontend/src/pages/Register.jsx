import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AvatarUpload from "../components/AvatarUpload";
import { Link } from "react-router-dom";
import "../styles/auth.css";
import api from "../api/api";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔴 ADDED: Password match check
  const isPasswordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);

      if (profilePhotoFile) {
        formData.append("profilePhoto", profilePhotoFile); // MUST MATCH multer
      }

      // DEBUG — TEMPORARY
      for (let pair of formData.entries()) {
        console.log("FORMDATA:", pair[0], pair[1]);
      }

      await api.post("/api/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate(`/verify-email?email=${encodeURIComponent(formData.get("email"))}`);
      // navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-split">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Register</h2>

        <div className="profile-picture-wrapper">
          <label className="profile-picture-label">Profile Picture</label>
          <AvatarUpload size="sm" onFileSelect={setProfilePhotoFile} />
        </div>

        {error && <div className="error">{error}</div>}

        <label>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          className="password-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>Re-enter Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {isPasswordMismatch && (
          <p className="error">
            Passwords do not match
          </p>
        )}

        <div className="reg-footer auth-footer">
          <span>Already have an account?</span>
          <Link to="/login" className="auth-link">
            login
          </Link>
        </div>

        <button type="submit" disabled={isPasswordMismatch}>
          {loading ? "Creating..." : "Register"}
        </button>
      </form>
    </div>
  );
}
