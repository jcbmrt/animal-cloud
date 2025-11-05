CREATE TABLE IF NOT EXISTS animals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  external_id TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  species TEXT,
  sex TEXT,
  age TEXT,
  location TEXT,
  shelter_name TEXT,
  status TEXT,
  main_image_url TEXT,
  posted_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_animals_location ON animals(location);
CREATE INDEX IF NOT EXISTS idx_animals_age ON animals(age);
CREATE INDEX IF NOT EXISTS idx_animals_status ON animals(status);
CREATE INDEX IF NOT EXISTS idx_animals_slug ON animals(slug);
