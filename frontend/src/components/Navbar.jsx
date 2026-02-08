import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { logoutUser } from "../api/auth";
import "../styles/navbar.css";
import pencilIcon from "../assets/pencil.svg";

import logo from "../assets/ForgeGrid.svg";
import avatarPlaceholder from "../assets/avatar-placeholder.png";

export default function Navbar() {
  const { user, setUser, stats } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const avatarUrl = user?.profile_photo
    ? `http://localhost:5000${user.profile_photo}`
    : avatarPlaceholder;

  useEffect(() => {
    const escHandler = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", escHandler);
    return () => window.removeEventListener("keydown", escHandler);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      navigate("/login");
      setMenuOpen(false);
    }
  };

  const navItems = [
    { label: "Dashboard", to: "/" },
    { label: "Courses", to: "/courses" },
    { label: "Reporting", to: "/reporting" },
    { label: "Settings", to: "/settings" },
  ];

  return (
    <>
      <header className="glass-navbar">
        <div className="navbar-inner">
          {/* Logo */}
          <div className="navbar-logo">
            <img
              src={logo}
              alt="ForgeGrid"
              className="logo-img"
              onClick={() => navigate("/")}
            />
            <span className="logo-text">LearnSphere</span>
          </div>

          {/* Desktop Menu */}
          <nav className="navbar-links">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="nav-link custom-link"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: user area + hamburger */}
          <div className="navbar-right">
            {/* Desktop user area */}
            <div className="user-area desktop-only">
              <a href="/profile" className="user-profile-hover">
                <img src={avatarUrl} alt="avatar" className="user-avatar" />

                <span className="edit-badge">
                  <img src={pencilIcon} alt="Edit profile" />
                </span>
              </a>
              <div className="user-info-stack">
                <span className="user-name">{user?.name ?? "Guest"}</span>
                {user && (
                  <div className="user-points-badge">
                    <span className="points-star">⭐</span>
                    <span className="points-count">{stats?.total_points || 0} pts</span>
                  </div>
                )}
              </div>

              {user ? (
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              ) : (
                <Link to="/login" className="login-link">
                  Login
                </Link>
              )}
            </div>

            {/* Hamburger (tablet/mobile) */}
            <button
              className={`hamburger ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {menuOpen && (
        <div className="menu-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true">
          <div className="mobile-links">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="mobile-link custom-link"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mobile-divider" />

          <div className="mobile-user">
            <a href="/profile" className="user-profile-hover mobile">
              <img src={avatarUrl} alt="avatar" className="mobile-avatar" />
              <span className="edit-badge">
                <img src={pencilIcon} alt="Edit profile" />
              </span>
            </a>

            <div className="mobile-user-info">
              <div className="mobile-user-name">{user?.name ?? "Guest"}</div>
              {user ? (
                <button className="mobile-logout" onClick={handleLogout}>
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="mobile-login"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
