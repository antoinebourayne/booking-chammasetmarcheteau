-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user'
);

-- Desks table (ajout colonnes de position)
CREATE TABLE IF NOT EXISTS desks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  top_pct NUMERIC(5,2),   -- en pourcentage, 0..100
  left_pct NUMERIC(5,2)   -- en pourcentage, 0..100
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  desk_id INTEGER NOT NULL REFERENCES desks(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  UNIQUE (desk_id, booking_date),
  UNIQUE (user_id, booking_date)
);

-- Seed users
INSERT INTO users (name, email) VALUES
  ('Jérôme', 'jerome@chammasetmarcheteau.com'),
  ('Héloïse', 'heloise@chammasetmarcheteau.com'),
  ('Marion', 'marion@chammasetmarcheteau.com'),
  ('Nicolas', 'nicolas@chammasetmarcheteau.com'),
  ('Kamil', 'kamil@chammasetmarcheteau.com'),
  ('Jeanne R', 'jeanne@chammasetmarcheteau.com'),
  ('Julien', 'julien@chammasetmarcheteau.com'),
  ('Raphaël', 'raphael@chammasetmarcheteau.com'),
  ('Agathe', 'agathe@chammasetmarcheteau.com'),
  ('Sandie', 'sandie@chammasetmarcheteau.com'),
  ('Capucine', 'capucine@chammasetmarcheteau.com'),
  ('Noémie', 'noemie@chammasetmarcheteau.com'),
  ('Arys', 'arys@chammasetmarcheteau.com'),
  ('Lola', 'lola@chammasetmarcheteau.com'),
  ('Christophe', 'christophe@chammasetmarcheteau.com'),
  ('Denis', 'denis@chammasetmarcheteau.com')
ON CONFLICT (email) DO NOTHING;

-- Make Lola admin
UPDATE users SET role = 'admin' WHERE name = 'Lola';

-- Seed desks (positions null par défaut : le front a un fallback)
INSERT INTO desks (name, location) VALUES
  ('Desk 1', 'ballu5_r2'),
  ('Desk 2', 'ballu5_r2'),
  ('Desk 3', 'ballu5_r2'),
  ('Desk 4', 'ballu5_r2'),
  ('Desk 5', 'ballu5_r2'),
  ('Desk 6', 'ballu5_r2'),
  ('Desk 7', 'ballu5_r2'),
  ('Desk 8', 'ballu5_r2'),
  ('Desk 9', 'ballu5_r2'),
  ('Desk 10', 'ballu5_r2'),
  ('Desk 11', 'ballu5_r3'),
  ('Desk 12', 'ballu5_r3'),
  ('Desk 13', 'ballu5_r3'),
  ('Desk 14', 'ballu5_r3'),
  ('Desk 15', 'ballu5_r3'),
  ('Desk 16', 'ballu5_r3')
ON CONFLICT DO NOTHING;

-- Seed example bookings of today
INSERT INTO bookings (desk_id, user_id, booking_date)
VALUES
  (3, 1,  CURRENT_DATE),
  (6, 2,  CURRENT_DATE),
  (7, 3,  CURRENT_DATE),
  (9, 4,  CURRENT_DATE),
  (10, 5, CURRENT_DATE),
  (4, 6,  CURRENT_DATE),
  (2, 7,  CURRENT_DATE),
  (1, 8,  CURRENT_DATE),
  (5, 9,  CURRENT_DATE),
  (11,10, CURRENT_DATE),
  (12,11, CURRENT_DATE),
  (13,12, CURRENT_DATE),
  (15,13, CURRENT_DATE),
  (16,14, CURRENT_DATE)
ON CONFLICT DO NOTHING;
