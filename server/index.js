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
      res.status(500).send('Erreur de récupération des disponibilités');
    }
  });
  
  app.post('/api/bookings', async (req, res) => {
    const { user_id, desk_id, booking_date } = req.body;
    const date = booking_date || new Date().toISOString().split('T')[0];
  
    const checkDeskTakenQuery = `
      SELECT 1 FROM bookings
      WHERE desk_id = $1 AND booking_date = $2
      LIMIT 1;
    `;
  
    const checkUserAlreadyBookedQuery = `
      SELECT 1 FROM bookings
      WHERE user_id = $1 AND booking_date = $2
      LIMIT 1;
    `;
  
    const insertBookingQuery = `
      INSERT INTO bookings (user_id, desk_id, booking_date)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
  
    try {
      const deskTaken = await db.query(checkDeskTakenQuery, [desk_id, date]);
      if (deskTaken.rows.length > 0) {
        return res.status(409).json({ error: 'Ce bureau est déjà pris pour cette date' });
      }
  
      const userAlreadyBooked = await db.query(checkUserAlreadyBookedQuery, [user_id, date]);
      if (userAlreadyBooked.rows.length > 0) {
        return res.status(409).json({ error: 'Vous avez déjà un bureau réservé pour cette date' });
      }
  
      const result = await db.query(insertBookingQuery, [user_id, desk_id, date]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send('Erreur de réservation');
    }
  });
  

  app.delete('/api/bookings', async (req, res) => {
    const { user_id, desk_id, booking_date } = req.body;
    const date = booking_date || new Date().toISOString().split('T')[0];
  
    try {
      const result = await db.query(
        'DELETE FROM bookings WHERE user_id = $1 AND desk_id = $2 AND booking_date = $3 RETURNING *;',
        [user_id, desk_id, date]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'No booking found to delete' });
      }
  
      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error deleting booking');
    }
  });
  
  
app.get('/api/users', async (req, res) => {
    const name = req.query.name;
    if (!name) return res.status(400).send('Name is required');
  
    try {
      const result = await db.query('SELECT id, name FROM users WHERE name = $1', [name]);
      if (result.rows.length === 0) return res.status(404).send('Utilisateur non trouvé');
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send('Erreur de récupération des utilisateurs');
    }
  });

  app.post('/api/login', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Le nom est requis' });
  
    try {
      const result = await db.query('SELECT id, name FROM users WHERE name = $1', [name]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send('Erreur authentification');
    }
  });
  
  
app.listen(3001, () => console.log('Server running on port 3001'));
