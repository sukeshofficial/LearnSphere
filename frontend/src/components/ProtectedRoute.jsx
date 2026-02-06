import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Spinner from "../components/ui/Spinner.jsx";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const [showSpinner, setShowSpinner] = useState(true);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setShowSpinner(false);
      }, 250); // 0.25 second delay

      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Show spinner while auth is loading OR delay is active
  if (loading || showSpinner) {
    return (
      <div style={styles.spinnerWrapper}>
        <Spinner size={50} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

const styles = {
  spinnerWrapper: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
