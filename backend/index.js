import express from "express";
import cors from "cors";
import pkg from "pg";
import "dotenv/config";

const { Pool } = pkg;
const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "moholla",
  password: process.env.DB_PASSWORD || "moholla_pass",
  database: process.env.DB_NAME || "moholla_fix",
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      photo_url TEXT,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      status TEXT DEFAULT 'reported',
      ward TEXT DEFAULT 'Unknown',
      supporter_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS report_updates (
      id SERIAL PRIMARY KEY,
      report_id INT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      kind TEXT NOT NULL,
      note TEXT,
      photo_url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

initDb().catch((err) => console.error("DB init failed", err));

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", db_time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.get("/api/reports", async (req, res) => {
  try {
    const { category, status, ward } = req.query;
    let query = `SELECT id, category, description, photo_url, latitude, longitude, status, ward, supporter_count, created_at FROM reports`;
    const values = [];
    const conditions = [];

    if (category) {
      conditions.push(`category ILIKE $${values.length + 1}`);
      values.push(`%${category}%`);
    }

    if (status) {
      conditions.push(`status = $${values.length + 1}`);
      values.push(status);
    }

    if (ward) {
      conditions.push(`ward ILIKE $${values.length + 1}`);
      values.push(`%${ward}%`);
    }

    if (conditions.length) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/reports", async (req, res) => {
  try {
    const {
      category,
      description,
      photo_url,
      latitude,
      longitude,
      ward = "Unknown",
    } = req.body;

    if (!category || !description || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "Please provide category, description, latitude, and longitude." });
    }

    const result = await pool.query(
      `INSERT INTO reports (category, description, photo_url, latitude, longitude, status, ward, supporter_count)
       VALUES ($1, $2, $3, $4, $5, 'reported', $6, 0)
       RETURNING *`,
      [category, description, photo_url || null, latitude, longitude, ward]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/reports/:id", async (req, res) => {
  try {
    const reportRes = await pool.query("SELECT * FROM reports WHERE id = $1", [req.params.id]);
    if (reportRes.rowCount === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    const updatesRes = await pool.query(
      "SELECT * FROM report_updates WHERE report_id = $1 ORDER BY created_at DESC",
      [req.params.id]
    );

    res.json({ report: reportRes.rows[0], updates: updatesRes.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/reports/:id/support", async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE reports
       SET supporter_count = supporter_count + 1
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    await pool.query(
      `INSERT INTO report_updates (report_id, kind, note) VALUES ($1, 'support', 'Added a voice of support')`,
      [req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/reports/:id/status", async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const result = await pool.query(
      `UPDATE reports
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    await pool.query(
      `INSERT INTO report_updates (report_id, kind, note) VALUES ($1, 'status_change', $2)`,
      [req.params.id, note || `Status updated to ${status}`]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/reports/:id/updates", async (req, res) => {
  try {
    const { note, photo_url } = req.body;
    if (!note) {
      return res.status(400).json({ message: "A note is required" });
    }

    const result = await pool.query(
      `INSERT INTO report_updates (report_id, kind, note, photo_url)
       VALUES ($1, 'update', $2, $3)
       RETURNING *`,
      [req.params.id, note, photo_url || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/ward-dashboard", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ward,
        COUNT(*) AS total_reports,
        SUM(CASE WHEN status = 'fixed' THEN 1 ELSE 0 END) AS resolved_reports
      FROM reports
      GROUP BY ward
      ORDER BY total_reports DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

app.post("/api/reports", async (req, res) => {
  try {
    const {
      category,
      description,
      latitude,
      longitude,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO reports
      (category, description, latitude, longitude)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
      `,
      [category, description, latitude, longitude]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});
