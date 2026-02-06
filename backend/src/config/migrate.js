import pool from "./db.js";

export const runMigrations = async () => {
  try {
    
    // Standard Columns for the User
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
      ADD COLUMN IF NOT EXISTS profile_photo TEXT,
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS reset_token TEXT,
      ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP,
      ADD COLUMN IF NOT EXISTS phone TEXT;
    `);

    console.log("✅ DB migrations completed");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
};
