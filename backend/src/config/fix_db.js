import pool from "./db.js";

export const fixReviewsTable = async () => {
    try {
        // Check if court_id exists and rename it to course_id
        await pool.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name='reviews' AND column_name='court_id'
                ) THEN
                    ALTER TABLE reviews RENAME COLUMN court_id TO course_id;
                END IF;
            END $$;
        `);
        console.log("✅ Reviews table fixed (if needed)");
    } catch (err) {
        console.error("❌ Failed to fix reviews table:", err.message);
    }
};
