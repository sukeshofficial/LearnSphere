import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/useAuth"; // <-- adjust if your hook lives elsewhere
import { verifySignupOtp, resendSignupOtp } from "../api/auth";
import "../styles/verifyotp.css";

const NUM_BOXES = 6;
const RESEND_COOLDOWN = 30; // seconds

export default function VerifyOtp() {
  const { setUser } = useAuth(); // your auth context (assumed)
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const [values, setValues] = useState(Array(NUM_BOXES).fill(""));
  const inputsRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState("");

  // redirect if no email
  useEffect(() => {
    if (!email) {
      // if you prefer a different route, change this:
      navigate("/signup");
    }
  }, [email, navigate]);

  useEffect(() => {
    // focus first empty input on mount
    const idx = values.findIndex((v) => v === "");
    inputsRef.current[idx === -1 ? NUM_BOXES - 1 : idx]?.focus();
  }, []);

  // cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(t);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleChange = (e, idx) => {
    const ch = e.target.value.replace(/\D/g, ""); // only digits
    if (!ch) {
      // clear value
      updateValue("", idx);
      return;
    }
    // If user pasted more than one digit, distribute
    if (ch.length > 1) {
      const digits = ch.split("");
      const next = [...values];
      let i = idx;
      digits.forEach((d) => {
        if (i < NUM_BOXES) {
          next[i] = d;
          i += 1;
        }
      });
      setValues(next);
      // focus next empty
      const firstEmpty = next.findIndex((v) => v === "");
      if (firstEmpty === -1) {
        inputsRef.current[NUM_BOXES - 1]?.focus();
      } else {
        inputsRef.current[firstEmpty]?.focus();
      }
      return;
    }

    // single digit
    updateValue(ch, idx);
    // move focus to next
    if (idx < NUM_BOXES - 1 && ch) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const updateValue = (val, idx) => {
    setValues((prev) => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      if (values[idx]) {
        updateValue("", idx);
      } else if (idx > 0) {
        inputsRef.current[idx - 1]?.focus();
        updateValue("", idx - 1);
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < NUM_BOXES - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData("text");
    const digits = paste.replace(/\D/g, "").slice(0, NUM_BOXES).split("");
    if (digits.length === 0) return;
    const next = [...values];
    for (let i = 0; i < NUM_BOXES; i++) {
      next[i] = digits[i] || "";
    }
    setValues(next);
    const firstEmpty = next.findIndex((v) => v === "");
    (firstEmpty === -1 ? inputsRef.current[NUM_BOXES - 1] : inputsRef.current[firstEmpty])?.focus();
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    setError(null);

    const otp = values.join("");
    if (otp.length !== NUM_BOXES) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifySignupOtp({ email, otp });
      // backend sets cookie; response contains user
      setUser(res.data.user);
      navigate("/"); // or your onboarding route
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError(null);
    setResendMessage("");
    try {
      setLoading(true);
      await resendSignupOtp({ email });
      setResendMessage("Verification code resent to your email.");
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-container">
        <h1 className="brand">LEARNSPHERE</h1>
        <h2 className="title">🔒 VERIFY YOUR EMAIL</h2>

        <p className="hint">
          We've sent a code to your email:
          <span className="email">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="otp-form" onPaste={handlePaste}>
          <div className="otp-row" role="group" aria-label="6 digit verification code">
            {values.map((val, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                className="otp-input"
                value={val}
                onChange={(e) => handleChange(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>

          {error && <div className="error">{error}</div>}
          {resendMessage && <div className="info">{resendMessage}</div>}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        <div className="links-row">
          <button
            type="button"
            className="link-btn"
            onClick={handleResend}
            disabled={cooldown > 0 || loading}
          >
            {cooldown > 0 ? `Resend OTP (${cooldown}s)` : "Resend OTP"}
          </button>

          <button
            type="button"
            className="link-btn secondary"
            onClick={() => navigate("/register")}
            disabled={loading}
          >
            Edit Email
          </button>
        </div>
      </div>
    </div>
  );
}
