import { useAuth } from "../context/useAuth";
import "../styles/public-profile.css";
import profilePlaceholder from "../assets/avatar-placeholder.png";

export default function PublicProfile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="public-profile-page">
      <a href="/profile" className="back-btn">
        ←
      </a>
      <div className="public-profile-card">
        <img
          src={
            user.profile_photo
              ? `http://localhost:5000${user.profile_photo}`
              : profilePlaceholder
          }
          alt="Profile"
          className="public-avatar"
        />

        <h2>{user.name}</h2>

        {user.bio && <p className="public-bio">{user.bio}</p>}

        {/* Email intentionally hidden */}
        <p className="public-note">
          This is how your profile appears to others.
        </p>
      </div>
    </div>
  );
}
