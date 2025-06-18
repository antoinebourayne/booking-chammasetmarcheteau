const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/availability', async (req, res) => {
    const date = req.query.date || new Date().toISOString().split('T')[0];
  
    const query = `
      SELECT
        d.id AS desk_id,
        d.name AS desk_name,
        d.location,
        b.user_id IS NOT NULL AS booked,
        u.id AS user_id,
        u.name AS user_name
      FROM desks d
      LEFT JOIN bookings b ON d.id = b.desk_id AND b.booking_date = $1
      LEFT JOIN users u ON u.id = b.user_id
      ORDER BY d.id;
    `;
  
    try {
      const result = await db.query(query, [date]);
      const data = result.rows.map(row => ({
        desk_id: row.desk_id,
        desk_name: row.desk_name,
        location: row.location,
        booked: row.booked,
        user: row.user_id ? { id: row.user_id, name: row.user_name } : null
      }));
  
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching availability');
    }
  });
  
app.post('/api/bookings', async (req, res) => {
    const { user_id, desk_id, booking_date } = req.body;
    const date = booking_date || new Date().toISOString().split('T')[0];
  
    const checkAvailabilityQuery = `
      SELECT 1 FROM bookings
      WHERE desk_id = $1 AND booking_date = $2
      LIMIT 1;
    `;
  
    const insertBookingQuery = `
      INSERT INTO bookings (user_id, desk_id, booking_date)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
  
    try {
      const existing = await db.query(checkAvailabilityQuery, [desk_id, date]);
  
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Desk is already booked for this date' });
      }
  
      const result = await db.query(insertBookingQuery, [user_id, desk_id, date]);
  
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error creating booking');
    }
  });
  
app.get('/api/users', async (req, res) => {
    const name = req.query.name;
    if (!name) return res.status(400).send('Name is required');
  
    try {
      const result = await db.query('SELECT id, name FROM users WHERE name = $1', [name]);
      if (result.rows.length === 0) return res.status(404).send('User not found');
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error checking user');
    }
  });
  
app.listen(3001, () => console.log('Server running on port 3001'));
