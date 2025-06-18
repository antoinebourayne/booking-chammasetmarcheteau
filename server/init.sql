-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);

-- Desks table
CREATE TABLE IF NOT EXISTS desks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  desk_id INT REFERENCES desks(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  UNIQUE (desk_id, booking_date),
  UNIQUE (user_id, booking_date)
);

-- Optional: some dummy data

INSERT INTO users (name, email)
VALUES
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
  ('Lola', 'lola@chammasetmarcheteau.com');

INSERT INTO desks (name, location)
VALUES
  ('Desk 1', 'Ballu 5 R2'),
  ('Desk 2', 'Ballu 5 R2'),
  ('Desk 3', 'Ballu 5 R2'),
  ('Desk 4', 'Ballu 5 R2'),
  ('Desk 5', 'Ballu 5 R2'),
  ('Desk 6', 'Ballu 5 R2'),
  ('Desk 7', 'Ballu 5 R2'),
  ('Desk 8', 'Ballu 5 R2'),
  ('Desk 9', 'Ballu 5 R2'),
  ('Desk 10', 'Ballu 5 R2'),
  ('Desk 11', 'Ballu 5 R2'),
  ('Desk 12', 'Ballu 5 R2'),
  ('Desk 13', 'Ballu 5 R2'),
  ('Desk 14', 'Ballu 5 R2');

INSERT INTO bookings (user_id, desk_id, booking_date)
VALUES
  (3, 1, CURRENT_DATE),
  (6, 2, CURRENT_DATE),
  (7, 3, CURRENT_DATE),
  (8, 4, CURRENT_DATE),
  (9, 5, CURRENT_DATE),
  (10, 7, CURRENT_DATE),
  (4, 8, CURRENT_DATE),
  (2, 9, CURRENT_DATE),
  (1, 10, CURRENT_DATE),
  (5, 11, CURRENT_DATE),
  (11, 12, CURRENT_DATE),
  (12, 13, CURRENT_DATE),
  (13, 14, CURRENT_DATE);
