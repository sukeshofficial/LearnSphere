import pool from "../config/db.js";

export async function getPublicProfile(req, res) {
  const { username } = req.params;

  const result = await pool.query(
    `
    SELECT name, bio, profile_photo, is_public
    FROM users
    WHERE username = $1
    `,
    [username],
  );

  if (!result.rows.length) {
    return res.status(404).json({
      message: "Profile not found",
    });
  }

  const user = result.rows[0];

  // 🔒 Profile is private
  if (!user.is_public) {
    return res.status(403).json({
      message: "This profile is private",
    });
  }

  // ✅ Profile is public
  return res.json({
    name: user.name,
    bio: user.bio,
    profile_photo: user.profile_photo,
    is_public: user.is_public
  });
}

export async function searchUsers(req, res) {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.json([]);
  }

  const result = await pool.query(
    `
    SELECT username, name, profile_photo
    FROM users
    WHERE is_public = true
      AND (
        username ILIKE $1 OR
        name ILIKE $1
      )
    LIMIT 10
    `,
    [`%${q}%`]
  );

  res.json(result.rows);
}
