import pool from "./db.js";

export const runMigrations = async () => {
  try {
    // Standard Columns for the User
    await pool.query("BEGIN");

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
      ADD COLUMN IF NOT EXISTS profile_photo TEXT,
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS reset_token TEXT,
      ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP,
      ADD COLUMN IF NOT EXISTS phone TEXT,
      ADD COLUMN IF NOT EXISTS role VARCHAR(30) DEFAULT 'user',
      ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
    `);

    await pool.query(`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trigger_set_updated_at ON users;

      CREATE TRIGGER trigger_set_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
    `);

    await pool.query(`
      ALTER TABLE users
      ALTER COLUMN password SET NOT NULL,
      ALTER COLUMN role SET NOT NULL,
      ALTER COLUMN is_super_admin SET NOT NULL,
      ALTER COLUMN is_active SET NOT NULL,
      ALTER COLUMN email_verified SET NOT NULL;
    `);

    await pool.query(`
      ALTER TABLE users
      DROP CONSTRAINT IF EXISTS role_check;
    `);

    await pool.query(`
      ALTER TABLE users
      ADD CONSTRAINT role_check
      CHECK (role IN ('user', 'admin', 'moderator', 'staff', 'instructor'));
  `);

    // ---------- EXTENSIONS ----------
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
    `);

    // ---------- ENUMS ----------
    await pool.query(`
    DO $$ BEGIN
      CREATE TYPE visibility_enum AS ENUM ('EVERYONE','SIGNED_IN');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await pool.query(`
    DO $$ BEGIN
      CREATE TYPE access_rule_enum AS ENUM ('OPEN','INVITE','PAID');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await pool.query(`
    DO $$ BEGIN
      CREATE TYPE lesson_type_enum AS ENUM ('VIDEO','DOCUMENT','IMAGE','LINK');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await pool.query(`
    DO $$ BEGIN
      CREATE TYPE enrollment_status_enum AS ENUM ('INVITED','ACTIVE','COMPLETED','CANCELLED');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await pool.query(`
    DO $$ BEGIN
      CREATE TYPE quiz_status_enum AS ENUM ('IN_PROGRESS','SUBMITTED','GRADED');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumlabel = 'SIGNED_IN'
          AND enumtypid = 'visibility_enum'::regtype
        ) THEN
          ALTER TYPE visibility_enum ADD VALUE 'SIGNED_IN';
        END IF;
      END$$;
    `)

    // ---------- COURSES ----------
    await pool.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      short_description TEXT,
      long_description TEXT,
      image_url TEXT,
      tags TEXT[],
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      visibility visibility_enum NOT NULL DEFAULT 'EVERYONE',
      access_rule access_rule_enum NOT NULL DEFAULT 'OPEN',
      price_cents INTEGER DEFAULT 0,
      is_published BOOLEAN NOT NULL DEFAULT false,
      total_views BIGINT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_courses_title
      ON courses USING gin (to_tsvector('english', title));
    `);

    // ---------- LESSONS ----------
    await pool.query(`
    CREATE TABLE IF NOT EXISTS lessons (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      type lesson_type_enum NOT NULL,
      content_url TEXT,
      duration_seconds INTEGER,
      allow_download BOOLEAN NOT NULL DEFAULT false,
      description TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_lessons_course_order
      ON lessons(course_id, order_index);
    `);

    // ---------- QUIZZES ----------
    await pool.query(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT,
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    `);

    await pool.query(`
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
      question_text TEXT NOT NULL,
      order_index INTEGER DEFAULT 0
    );
    `);

    await pool.query(`
    CREATE TABLE IF NOT EXISTS quiz_options (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
      option_text TEXT NOT NULL,
      is_correct BOOLEAN DEFAULT false,
      order_index INTEGER DEFAULT 0
    );
    `);

    await pool.query(`
    CREATE TABLE IF NOT EXISTS quiz_rewards (
      quiz_id UUID PRIMARY KEY REFERENCES quizzes(id) ON DELETE CASCADE,
      attempt_1_points INTEGER DEFAULT 0,
      attempt_2_points INTEGER DEFAULT 0,
      attempt_3_points INTEGER DEFAULT 0,
      attempt_4_plus_points INTEGER DEFAULT 0
    );
    `);

    // ---------- ENROLLMENTS ----------
    await pool.query(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
      status enrollment_status_enum DEFAULT 'INVITED',
      enrolled_at TIMESTAMPTZ,
      invited_by UUID REFERENCES users(id),
      invite_token TEXT,
      payment_txn_id TEXT,
      UNIQUE(user_id, course_id)
    );
    `);

    // ---------- PROGRESS ----------
    await pool.query(`
    CREATE TABLE IF NOT EXISTS lesson_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
      course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
      completed BOOLEAN DEFAULT false,
      completed_at TIMESTAMPTZ,
      time_spent_seconds INTEGER DEFAULT 0,
      UNIQUE(user_id, lesson_id)
    );
    `);

    // ---------- REVIEWS ----------
    await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id),
      rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
      review_text TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    `);

    await pool.query(`
      UPDATE users SET role='user' WHERE role IS NULL;
      ALTER TABLE users
      ALTER COLUMN role SET NOT NULL;
    `);

    await pool.query("COMMIT");
    console.log("✅ Schema created successfully");

    console.log("✅ DB migrations completed");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
};
