import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Connect to Postgres
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
});

// Function to create tables
export async function initializeDB() {
  try {
    // enable geo-spatial features
    await pool.query(`CREATE EXTENSION IF NOT EXISTS postgis;`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS parking_spots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        location GEOGRAPHY(Point, 4326) NOT NULL,
        capacity INT,
        sheltered BOOLEAN,
        type TEXT CHECK(type IN ('official', 'community'))
      );
    `);

    // create geo-spatial index
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_parking_location 
      ON parking_spots USING GIST(location);
    `);

    console.log("Database initialized successfully.");
  } catch (err) {
    console.error("Error initializing database:", err);
  }
}

export { pool };
