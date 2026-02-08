import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api";
import { getUserEnrollments } from "../api/enrollments";
import { getLearnerStats } from "../services/learnerApi";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]); // ADDED: store enrolled course IDs for global access
  const [stats, setStats] = useState(null); // ADDED: global user stats (points, badges)
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const res = await api.get("/api/auth/me");
        if (!cancelled) {
          setUser(res.data.user);
        }
      } catch (err) {
        if (!cancelled) {
          setUser(null);

          // if (err.response?.status === 401) {
          //   navigate("/login", { replace: true });
          // }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchEnrollments = async () => {
    if (!user) return;
    try {
      const res = await getUserEnrollments();
      const ids = res.data.enrollments.map((e) => e.course_id);
      setEnrolledCourseIds(ids);
    } catch (err) {
      console.error("Failed to fetch enrollments", err);
    }
  };

  const refreshStats = async () => {
    if (!user) return;
    try {
      const res = await getLearnerStats();
      setStats(res.data);
    } catch (err) {
      console.warn("Failed to fetch global stats, using fallback");
      setStats({
        total_points: 0,
        current_badge: "Newbie"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchEnrollments();
      refreshStats();
    } else {
      setEnrolledCourseIds([]);
      setStats(null);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, enrolledCourseIds, fetchEnrollments, stats, refreshStats }}>
      {children}
    </AuthContext.Provider>
  );
}
