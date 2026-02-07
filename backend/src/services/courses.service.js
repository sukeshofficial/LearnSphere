import pool from "../config/db.js";

export async function createCourse(userId, title) {
  const { rows } = await pool.query(
    `
    INSERT INTO courses (title, created_by)
    VALUES ($1, $2)
    RETURNING
      id,
      title,
      is_published,
      created_by,
      created_at
    `,
    [title, userId]
  );

  return rows[0];
}

