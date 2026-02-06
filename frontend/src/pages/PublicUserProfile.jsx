import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import profilePlaceholder from "../assets/avatar-placeholder.png";
import "../styles/public-profile.css";
import { getUserProfile } from "../api/userProfile";

export default function PublicUserProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile(username);

        setProfile(res.data);
        setError("");
      } catch (err) {
        if (err.response?.status === 403) {
          setError("This profile is private");
        } else if (err.response?.status === 404) {
          setError("Profile not found");
        } else {
          setError("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="public-profile-page">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-profile-page">
        <div className="public-profile-card">
          <h3>Profile unavailable</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-profile-page">
      <a href="/" className="back-btn">
        ←
      </a>

      <div className="public-profile-card">
        <img
          src={
            profile.profile_photo
              ? `http://localhost:5000${profile.profile_photo}`
              : profilePlaceholder
          }
          alt="Profile"
          className="public-avatar"
        />
        <p className="public-tag">
          {profile.is_public ? "Public Profile" : "Private Profile"}
        </p>
        <h2>{profile.name}</h2>

        {profile.bio && <p className="public-bio">{profile.bio}</p>}

        <p className="public-note">Public profile · @{username}</p>
      </div>
    </div>
  );
}
