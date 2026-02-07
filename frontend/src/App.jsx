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
import ReportingPage from "./pages/ReportingPage";
import QuizBuilderPage from "./pages/QuizBuilderPage";
import MyCoursesPage from "./pages/MyCoursesPage";
import CoursePlayerPage from "./pages/CoursePlayerPage";
import "./App.css";
import "./styles/dashboard.css";

function CoursesRouteWrapper() {
  const { user } = useAuth();
  const location = useLocation();

  // Use standardized role check for admin/instructor view
  const userRole = (user?.role || "").toLowerCase();
  const isAdminView = userRole === 'admin' || userRole === 'instructor' || user?.is_super_admin;

  if (isAdminView) {
    return (
      <ProtectedRoute>
        <CoursesKanbanPage />
      </ProtectedRoute>
    );
  }
  // Otherwise show learner view (public or enrolled user)
  return <MyCoursesPage key={location.key} />;
}

function AppWrapper() {
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/register", "/forgot-password", "/quiz-builder"];
  const hideNavbar =
    hideNavbarPaths.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password") ||
    location.pathname.startsWith("/quiz-builder");

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
          path="/courses/:id"
          element={
            <ProtectedRoute>
              <CoursePlayerPage />
            </ProtectedRoute>
          }
        />

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
        <Route
          path="/reporting"
          element={
            <ProtectedRoute>
              <ReportingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz-builder/:quizId"
          element={
            <ProtectedRoute>
              <QuizBuilderPage />
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
