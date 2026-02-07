import bcrypt from "bcrypt";
import crypto from "crypto";
import pool from "../config/db.js";
import { generateToken } from "../utils/jwt.js";
import { sendEmail } from "../utils/sendEmail.js";


// ---------- Helper: create 6-digit OTP ----------
const createNumericOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit string
};


export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Basic Validation all the required fields exist?
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    // Password length must be > 6
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Check if User already exists?
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "User already exists with this email",
      });
    }

    // Generate username
    const username = await generateUsername(email);

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    const profilePhotoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const allowedRoles = ["learner", "instructor"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role selected",
      });
    }
    // Insert New User
    const newUser = await pool.query(
      `
      INSERT INTO users (name, username, email, password, role, profile_photo)
      VALUES ($1, $2, $3, $4, $5, $6)

      RETURNING id, name, username, email, role, profile_photo, created_at
      `,
      [name, username, email, hashedPassword, role, profilePhotoPath],
    );

    const user = newUser.rows[0]

    // --- Generate numeric OTP, hash it, store in reset_token (reusing fields) ---
    const otp = createNumericOtp(); // e.g. "483921"
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await pool.query(
      `UPDATE users
       SET reset_token = $1,
           reset_token_expiry = $2
       WHERE id = $3`,
      [hashedOtp, expiry, user.id]
    );

    // Send the OTP by email (plain OTP in email; hashed stored in DB)
    await sendEmail({
      to: email,
      subject: "Your verification code",
      html: `
        <p>Welcome — please verify your email to continue.</p>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>This code will expire in 5 minutes.</p>
      `,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ---------- Verify signup OTP endpoint ----------
export const verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Hash incoming otp to compare with DB
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Find user where reset_token matches and not expired
    const result = await pool.query(
      `SELECT id, name, username, email, profile_photo, created_at
       FROM users
       WHERE email = $1
         AND reset_token = $2
         AND reset_token_expiry > NOW()`,
      [email, hashedOtp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = result.rows[0];

    // Clear reset_token fields now that it's used
    await pool.query(
      `UPDATE users
       SET reset_token = NULL,
           reset_token_expiry = NULL
       WHERE id = $1`,
      [user.id]
    );

    // Fetch full user for token (including role from DB)
    const userRoleResult = await pool.query("SELECT role, is_super_admin FROM users WHERE id = $1", [user.id]);
    const dbUser = userRoleResult.rows[0];

    // Create JWT token and set cookie (same as loginUser)
    const token = generateToken({
      userId: user.id,
      role: (dbUser.role || "user").toLowerCase(),
      is_super_admin: dbUser.is_super_admin || false
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    // Return user info (without password)
    return res.status(200).json({
      message: "Email verified and authenticated successfully",
      user,
    });

  } catch (error) {
    console.error("VERIFY SIGNUP OTP ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// ---------- Optional: Resend OTP (useful) ----------
export const resendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const userResult = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "No account found for this email" });
    }

    const userId = userResult.rows[0].id;
    const otp = createNumericOtp();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5mins

    await pool.query(
      `UPDATE users
       SET reset_token = $1,
           reset_token_expiry = $2
       WHERE id = $3`,
      [hashedOtp, expiry, userId]
    );

    await sendEmail({
      to: email,
      subject: "Your verification code (resend)",
      html: `
        <p>Your new verification code is: <strong>${otp}</strong></p>
        <p>This code will expire in 5 minutes.</p>
      `,
    });

    return res.json({ message: "Verification code resent" });
  } catch (error) {
    console.error("RESEND SIGNUP OTP ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic Validation all the required fields exist?
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find User from DB
    const userResult = await pool.query(
      "SELECT id, name, email, password, profile_photo, role, is_super_admin, created_at FROM users WHERE email = $1",
      [email],
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // User exists, then store in user
    const user = userResult.rows[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid password credentials",
      });
    }

    // Remove password before sending
    delete user.password;

    // Create token with role
    const token = generateToken({
      userId: user.id,
      role: (user.role || "user").toLowerCase(),
      is_super_admin: user.is_super_admin || false
    });

    // Set Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    // Success
    return res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({
    message: "Logged out successfully",
  });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    // Always return success (security best practice)
    if (userResult.rows.length === 0) {
      return res.json({
        message: "If this email exists, a reset link has been sent",
      });
    }

    const userId = userResult.rows[0].id;

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      `
      UPDATE users
      SET reset_token = $1,
          reset_token_expiry = $2
      WHERE id = $3
      `,
      [hashedToken, expiry, userId],
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
        <br/>
        <p>If you didn’t request this, you can ignore this email.</p>
      `,
    });

    return res.json({
      message: "If this email exists, a reset link has been sent",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token missing" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password too short" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const result = await pool.query(
      `
      SELECT id FROM users
      WHERE reset_token = $1
        AND reset_token_expiry > NOW()
      `,
      [hashedToken],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    const userId = result.rows[0].id;
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `
      UPDATE users
      SET password = $1,
          reset_token = NULL,
          reset_token_expiry = NULL
      WHERE id = $2
      `,
      [hashedPassword, userId],
    );

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Helper Functions
const generateUsername = async (email) => {
  // Base username from email
  let baseUsername = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, ""); // keep only safe chars

  let username = baseUsername;
  let counter = 1;

  // Check if username exists
  while (true) {
    const result = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username],
    );

    if (result.rows.length === 0) break;

    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
};
