export default function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userRole = req.user.role?.toLowerCase();
    const allowed = roles.map((r) => r.toLowerCase());

    if (!allowed.includes(userRole)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
}
