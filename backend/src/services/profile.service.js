import pool from "../config/db.js";

export async function updateProfile(
  userId,
  { name, bio, profile_photo, is_public },
) {
  // console.log("USER ID:", userId);
  // console.log("TYPE:", typeof userId);
  const query = `
    UPDATE users
    SET
      name = COALESCE(NULLIF($1, ''), name),
      bio = COALESCE(NULLIF($2, ''), bio),
      profile_photo = COALESCE(NULLIF($3, ''), profile_photo),
      is_public = COALESCE($4, is_public)
    WHERE id = $5
    RETURNING id, name, email, bio, profile_photo, is_public;
`;

  const values = [
    name ?? null,
    bio ?? null,
    profile_photo === undefined ? null : profile_photo,
    is_public ?? null,
    userId,
  ];

  const { rows } = await pool.query(query, values);
  // console.log(rows[0]);
  return rows[0];
}

export async function deleteUserProfile(userId) {
  const query = `
    DELETE FROM users
    WHERE id = $1;
  `;

  await pool.query(query, [userId]);
}
