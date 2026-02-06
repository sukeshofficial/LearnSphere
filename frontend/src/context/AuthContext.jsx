import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
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

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
