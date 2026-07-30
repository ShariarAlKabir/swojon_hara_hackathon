import express from "express";
import cors from "cors";
import pkg from "pg";
import crypto from "crypto";
import "dotenv/config";

const { Pool } = pkg;
const app = express();
const TOKEN_TTL_SECONDS = 60 * 60 * 24;
const MAX_ACTION_DISTANCE_KM = 2;
const TOKEN_SECRET = process.env.TOKEN_SECRET || "moholla-fix-local-development-secret";
const REPORT_CATEGORIES = new Set([
  "streetlight",
  "garbage",
  "pothole",
  "open_manhole",
  "flooding",
  "other",
]);

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
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      email VARCHAR(120) UNIQUE NOT NULL,
      phone VARCHAR(20) UNIQUE NOT NULL,
      nid VARCHAR(30) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      ward VARCHAR(50),
      area VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

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
      user_id INT REFERENCES users(id),
      action_latitude DOUBLE PRECISION,
      action_longitude DOUBLE PRECISION,
      distance_km DOUBLE PRECISION,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE report_updates
      ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id),
      ADD COLUMN IF NOT EXISTS action_latitude DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS action_longitude DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS distance_km DOUBLE PRECISION
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS report_supports (
      id SERIAL PRIMARY KEY,
      report_id INT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      note TEXT,
      action_latitude DOUBLE PRECISION NOT NULL,
      action_longitude DOUBLE PRECISION NOT NULL,
      distance_km DOUBLE PRECISION NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (report_id, user_id)
    )
  `);
}

initDb().catch((err) => console.error("DB init failed", err));

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function encodeTokenPart(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function createToken(userId) {
  const payload = encodeTokenPart({
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  });
  const signature = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifyToken(token) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) throw new Error("Invalid token");

  const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest();
  const received = Buffer.from(signature, "base64url");
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    throw new Error("Invalid token");
  }

  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (!decoded.sub || !decoded.exp || decoded.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error("Expired token");
  }
  return decoded;
}

async function requireAuth(req, res, next) {
  const authorization = req.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) {
    return res.status(401).json({ code: "AUTH_REQUIRED", message: "Log in to continue." });
  }

  try {
    const payload = verifyToken(token);
    const result = await pool.query(
      "SELECT id, full_name, email, phone, ward, area FROM users WHERE id = $1",
      [payload.sub]
    );
    if (result.rowCount === 0) throw new Error("Unknown user");
    req.user = result.rows[0];
    next();
  } catch {
    return res.status(401).json({
      code: "INVALID_TOKEN",
      message: "Your session has expired. Please log in again.",
    });
  }
}

function parseCoordinates(body) {
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }
  return { latitude, longitude };
}

function distanceInKm(fromLat, fromLng, toLat, toLng) {
  const radians = (degrees) => degrees * (Math.PI / 180);
  const earthRadiusKm = 6371;
  const latitudeDelta = radians(toLat - fromLat);
  const longitudeDelta = radians(toLng - fromLng);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(fromLat)) *
      Math.cos(radians(toLat)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function requireNearbyReport(req, res, next) {
  const coordinates = parseCoordinates(req.body);
  if (!coordinates) {
    return res.status(400).json({
      code: "LOCATION_REQUIRED",
      message: "Your live location is required for this action.",
    });
  }

  try {
    const reportResult = await pool.query(
      "SELECT id, latitude, longitude FROM reports WHERE id = $1",
      [req.params.id]
    );
    if (reportResult.rowCount === 0) {
      return res.status(404).json({ code: "REPORT_NOT_FOUND", message: "Report not found." });
    }

    const report = reportResult.rows[0];
    const distanceKm = distanceInKm(
      coordinates.latitude,
      coordinates.longitude,
      report.latitude,
      report.longitude
    );

    if (distanceKm > MAX_ACTION_DISTANCE_KM) {
      return res.status(403).json({
        code: "TOO_FAR",
        message: `You are ${distanceKm.toFixed(1)} km away. You must be within ${MAX_ACTION_DISTANCE_KM} km of this report.`,
        distance_km: Number(distanceKm.toFixed(3)),
      });
    }

    req.actionLocation = { ...coordinates, distanceKm };
    req.report = report;
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", db_time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { full_name, email, phone, nid, password, ward, area } = req.body;

    if (!full_name || !email || !phone || !nid || !password) {
      return res.status(400).json({ message: "Please provide full name, email, phone, NID, and password." });
    }

    const existing = await pool.query("SELECT id FROM users WHERE email = $1 OR phone = $2 OR nid = $3", [email, phone, nid]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "A user with that email, phone, or NID already exists." });
    }

    const password_hash = hashPassword(password);
    const result = await pool.query(
      `INSERT INTO users (full_name, email, phone, nid, password_hash, ward, area)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, full_name, email, phone, ward, area, created_at`,
      [full_name, email, phone, nid, password_hash, ward || null, area || null]
    );

    res.status(201).json({
      message: "Account created successfully",
      user: result.rows[0],
      token: createToken(result.rows[0].id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const result = await pool.query(
      "SELECT id, full_name, email, phone, ward, area, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = result.rows[0];
    if (user.password_hash !== hashPassword(password)) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const { password_hash, ...safeUser } = user;
    res.json({
      message: "Login successful",
      user: safeUser,
      token: createToken(user.id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
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

app.post("/api/reports", requireAuth, async (req, res) => {
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
    if (!REPORT_CATEGORIES.has(category)) {
      return res.status(400).json({ message: "Please choose a valid report category." });
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
      `SELECT id, report_id, kind, note, photo_url, action_latitude, action_longitude,
        distance_km, created_at,
        CASE WHEN user_id IS NULL THEN 'Legacy update' ELSE 'Verified neighbor #' || user_id END AS actor_label
       FROM report_updates
       WHERE report_id = $1
       ORDER BY created_at DESC`,
      [req.params.id]
    );

    res.json({ report: reportRes.rows[0], updates: updatesRes.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/reports/:id/support", requireAuth, requireNearbyReport, async (req, res) => {
  const client = await pool.connect();
  try {
    const { latitude, longitude, distanceKm } = req.actionLocation;
    const note = String(req.body.note || "").trim() || null;
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO report_supports
        (report_id, user_id, note, action_latitude, action_longitude, distance_km)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.params.id, req.user.id, note, latitude, longitude, distanceKm]
    );

    const result = await client.query(
      `UPDATE reports
       SET supporter_count = supporter_count + 1
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    await client.query(
      `INSERT INTO report_updates
        (report_id, kind, note, user_id, action_latitude, action_longitude, distance_km)
       VALUES ($1, 'support', $2, $3, $4, $5, $6)`,
      [req.params.id, note || "Added a voice of support", req.user.id, latitude, longitude, distanceKm]
    );

    await client.query("COMMIT");
    res.json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code === "23505") {
      return res.status(409).json({
        code: "ALREADY_SUPPORTED",
        message: "You have already added your voice to this report.",
      });
    }
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
});

app.post("/api/reports/:id/status", requireAuth, requireNearbyReport, async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!["reported", "in_progress", "fixed"].includes(status)) {
      return res.status(400).json({ message: "Choose a valid report status." });
    }
    const { latitude, longitude, distanceKm } = req.actionLocation;

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
      `INSERT INTO report_updates
        (report_id, kind, note, user_id, action_latitude, action_longitude, distance_km)
       VALUES ($1, 'status_change', $2, $3, $4, $5, $6)`,
      [req.params.id, note || `Status updated to ${status}`, req.user.id, latitude, longitude, distanceKm]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/reports/:id/updates", requireAuth, requireNearbyReport, async (req, res) => {
  try {
    const { note, photo_url } = req.body;
    if (!note) {
      return res.status(400).json({ message: "A note is required" });
    }

    const { latitude, longitude, distanceKm } = req.actionLocation;
    const result = await pool.query(
      `INSERT INTO report_updates
        (report_id, kind, note, photo_url, user_id, action_latitude, action_longitude, distance_km)
       VALUES ($1, 'update', $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.params.id, note, photo_url || null, req.user.id, latitude, longitude, distanceKm]
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
