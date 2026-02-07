import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const requireAuth = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch full user details from DB to ensure role/admin status is present and fresh
    const { rows } = await pool.query(
      "SELECT id, role, is_super_admin FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    req.user = rows[0];
    req.userId = rows[0].id;
    console.log(`[Auth] User Authenticated: ID=${req.userId}, Role=${req.user.role}`);
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log("[Role] Unauthorized: No user in request");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userRole = (req.user.role || "").toLowerCase();
    const allowedRoles = roles.map(r => r.toLowerCase());

    console.log(`[Role] Checking roles: Required=${JSON.stringify(allowedRoles)}, UserRole=${userRole}, IsSuperAdmin=${req.user.is_super_admin}`);

    if (req.user.is_super_admin) {
      return next();
    }

    if (allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({ error: "Forbidden: Access denied" });
  };
};

export default requireAuth;
