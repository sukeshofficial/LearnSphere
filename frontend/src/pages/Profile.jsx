import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { deleteProfile, editProfile } from "../api/editProfile";

import "../styles/profile.css";
import "../styles/delete-modal.css";


import Spinner from "../components/ui/Spinner.jsx";
import pencilIcon from "../assets/pencil.svg";
import profilePlaceholder from "../assets/avatar-placeholder.png";
import tickIcon from "../assets/check-small.svg";
import failIcon from "../assets/fail-small.svg";
import copyIcon from "../assets/copy.svg";
import copyFilledIcon from "../assets/copy-filled.svg";
import lockIcon from "../assets/lock.svg";

export default function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // Profile states
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isPublic, setIsPublic] = useState(user?.is_public ?? false);
  const [loading, setLoading] = useState(false);
  const [showSpinner, setShowSpinner] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpinner(false);
    }, 100); // 10 ms delay

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user && isEditing) {
      setName(user.name || "");
      setBio(user.bio || "");
      setIsPublic(user.is_public ?? false);
    }
  }, [isEditing, user]);


  if (!user || showSpinner) {
    return (
      <div style={styles.spinnerWrapper}>
        <Spinner size={50} />
      </div>
    );
  }

  const handleSave = async () => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);
      formData.append("is_public", isPublic.toString());

      if (profilePhoto) {
        formData.append("profile_photo", profilePhoto);
      }

      const res = await editProfile(formData);

      const data = res.data;

      if (data.user) {
        setUser(data.user);
        setName(data.user.name || "");
        setBio(data.user.bio || "");
        setProfilePhoto(null);
        setIsEditing(false);
      }

      setToast({ type: "success", text: data.message || "Profile updated" });

      setTimeout(() => {
        setToast(null);
      }, 2500);
    } catch (err) {
      setToast({
        type: "error",
        text: err.response?.data?.message || "Profile update failed",
      });

      setTimeout(() => {
        setToast(null);
      }, 2500);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);

    try {
      const res = await deleteProfile();

      setUser(null);
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);

      alert("Something went wrong while deleting your account.");
      setUser(null);
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setConfirmDelete(false);
    }
  };

  const handleRemovePhoto = async () => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("use_placeholder", "true");

      const res = await editProfile(formData);
      const data = res.data;

      if (data.user) {
        setUser(data.user);
        setProfilePhoto(null);
      }

      setToast({ type: "success", text: "Profile picture removed" });
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      setToast({
        type: "error",
        text: "Failed to remove profile picture",
      });
      setTimeout(() => setToast(null), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <a href="/" className="back-btn">
        ←
      </a>
      <div className="profile-card">
        {/* Header */}
        <div className="profile-header">
          <h2>My Profile</h2>

          <div className="profile-header-actions">
            {!isEditing && (
              <button
                className="public-profile-btn"
                onClick={() => navigate("/profile/public")}
              >
                View as Public
              </button>
            )}

            {!isEditing && (
              <button
                className="edit-btn icon-btn"
                onClick={() => setIsEditing(true)}
                title="Edit profile"
              >
                <img src={pencilIcon} alt="Edit" />
              </button>
            )}
          </div>
        </div>

        {/* Avatar */}
        <div className="avatar-section">
          <img
            src={
              profilePhoto
                ? URL.createObjectURL(profilePhoto)
                : user.profile_photo
                  ? `http://localhost:5000${user.profile_photo}`
                  : profilePlaceholder
            }
            alt="Profile"
            className="profile-avatar"
          />

          {/* upload-group */}
          {isEditing && (
            <div className="upload-group">
              <label htmlFor="profile-photo" className="upload-label">
                Upload
              </label>
              <input
                id="profile-photo"
                className="file-input"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) setProfilePhoto(e.target.files[0]);
                }}
              />
              <div style={{ fontSize: 13, color: "#6B7280" }}>
                Change profile picture
              </div>
            </div>
          )}

          {/* remove-photo-btn */}
          {isEditing && user.profile_photo && (
            <button
              type="button"
              className="remove-photo-btn"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (loading) return;
                await handleRemovePhoto();
              }}
              disabled={loading}
            >
              Remove profile picture
            </button>
          )}

          {/* share-link-btn */}
          {!isEditing && user.username && (
            <button
              type="button"
              className="share-link-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowShareModal(true);
              }}
            >
              Share Profile
            </button>
          )}
        </div>

        {/* Name */}
        <label>Full Name</label>
        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        ) : (
          <p className="profile-text">{user.name}</p>
        )}

        {/* Email (read-only always) */}
        <label>Email</label>
        <p className="profile-text muted">{user.email}</p>

        {/* Bio */}
        <label>Bio</label>
        {isEditing ? (
          <textarea
            className="bio-textarea"
            rows="3"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        ) : (
          <p className="profile-text">{user.bio || "No bio added"}</p>
        )}
        {/* Actions */}

        {isEditing && (
          <div className="visibility-toggle">
            <label className="switch">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
            <span>Public Profile</span>
          </div>
        )}

        {isEditing && (
          <div className="profile-actions">
            <button
              className="secondary-btn"
              onClick={() => {
                setIsEditing(false);
                setBio(user.bio || "");
                setName(user.name || "");
              }}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="button"
              className="primary-btn"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        )}



        {toast && (
          <div className={`toast glass toast-${toast.type}`}>
            {toast.type === "success" && (
              <img src={tickIcon} alt="Success" className="toast-icon" />
              // <TickIcon className="toast-icon" />
            )}
            {toast.type === "error" && (
              <img src={failIcon} alt="Failure" className="toast-icon" />
              // <TickIcon className="toast-icon" />
            )}
            <span>{toast.text}</span>
          </div>
        )}

        {/* Delete Account button */}
        <div className="danger-zone">
          <button
            className="danger-btn"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Account
          </button>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h3>Delete Account</h3>

              <p className="modal-warning">
                This action is <strong>irreversible</strong>. All your data will
                be permanently deleted.
              </p>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.checked)}
                />
                I understand that this action cannot be undone
              </label>

              <div className="modal-actions">
                <button
                  className="secondary-btn"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setConfirmDelete(false);
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  className="danger-btn"
                  disabled={!confirmDelete || loading}
                  onClick={handleDeleteAccount}
                >
                  {loading ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Link modal */}
        {showShareModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h3>Share your profile</h3>

              <p className="modal-subtext">
                Anyone with this link can view your public profile.
              </p>

              <div className="share-link-box">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/u/${user.username}`}
                />

                <button
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/u/${user.username}`,
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  <img
                    src={copied ? copyFilledIcon : copyIcon}
                    alt="Copy"
                    className="copy-icon"
                  />
                </button>
              </div>

              {copied && <p className="copied-text">Link copied!</p>}

              <div className="modal-actions">
                <button
                  className="secondary-btn"
                  onClick={() => {
                    setShowShareModal(false);
                    setCopied(false);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* {loading && (
        <div className="spinner-overlay">
          <Spinner size={50} />
        </div>
      )} */}
    </div>
  );
}

const styles = {
  spinnerWrapper: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
