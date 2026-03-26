import express from "express";
import cors from "cors";
import { Pool } from "pg";

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
});

// Example endpoint: nearby parking spots
app.get("/api/parking/nearby", async (req, res) => {
  const { lat, lng, radius = 500 } = req.query;
  if (!lat || !lng) return res.status(400).send("lat and lng required");

  try {
    const result = await pool.query(
      `
      SELECT id, name, ST_X(location::geometry) AS lng, ST_Y(location::geometry) AS lat, capacity, sheltered, type
      FROM parking_spots
      WHERE ST_DWithin(location, ST_MakePoint($1, $2)::geography, $3)
      ORDER BY ST_Distance(location, ST_MakePoint($1, $2)::geography)
      `,
      [Number(lng), Number(lat), Number(radius)],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database query failed");
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
