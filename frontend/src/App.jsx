import { Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "./context/useAuth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import PublicProfile from "./pages/PublicProfile";
import PublicUserProfile from "./pages/PublicUserProfile";
import CoursesKanbanPage from "./pages/CoursesKanbanPage";
import CourseEditPage from "./pages/CourseEditPage";
import UserCoursesPage from "./pages/UserCoursesPage";
import "./App.css";
import "./styles/dashboard.css";

function CoursesRouteWrapper() {
  const { user } = useAuth();
  // Check if user is admin
  if (user && (user.role === 'admin' || user.is_superadmin)) {
    return (
      <ProtectedRoute>
        <CoursesKanbanPage />
      </ProtectedRoute>
    );
  }
  // Otherwise show user view (public or enrolled user)
  return <UserCoursesPage />;
}

function AppWrapper() {
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/register", "/forgot-password"];
  const hideNavbar =
    hideNavbarPaths.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password");

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/profile" element={<Profile />} />

        {/* Dynamic Courses Route */}
        <Route path="/courses" element={<CoursesRouteWrapper />} />

        <Route
          path="/courses/new"
          element={
            <ProtectedRoute>
              <CourseEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:id/edit"
          element={
            <ProtectedRoute>
              <CourseEditPage />
            </ProtectedRoute>
          }
        />
        <Route path="/profile/public" element={<PublicProfile />} />
        <Route path="/u/:username" element={<PublicUserProfile />} />
      </Routes>
    </>
  );
}

export default function App() {
  return <AppWrapper />;
}
