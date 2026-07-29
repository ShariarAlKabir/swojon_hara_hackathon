CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status TEXT DEFAULT 'reported', -- reported / in_progress / fixed
  ward TEXT,
  supporter_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO reports (category, description, photo_url, latitude, longitude, status, ward, supporter_count) VALUES
('pothole', 'Deep pothole causing accidents near the bus stop', 'https://placehold.co/400x300?text=Pothole', 23.7461, 90.3742, 'reported', 'Ward 12', 6),
('flooding', 'Road floods every monsoon, knee-deep water', 'https://placehold.co/400x300?text=Flooding', 23.7509, 90.3935, 'in_progress', 'Ward 15', 9),
('streetlight', 'Streetlight has been off for 2 weeks', 'https://placehold.co/400x300?text=Streetlight', 23.7398, 90.3654, 'reported', 'Ward 12', 1),
('garbage', 'Garbage pile blocking the drain', 'https://placehold.co/400x300?text=Garbage', 23.7562, 90.3891, 'fixed', 'Ward 8', 4),
('open_manhole', 'Open manhole, no cover, dangerous at night', 'https://placehold.co/400x300?text=Manhole', 23.7443, 90.3800, 'reported', 'Ward 15', 2);
