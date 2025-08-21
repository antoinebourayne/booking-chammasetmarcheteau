const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ---- AUTH ----
app.post('/api/login', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Le nom est requis' });

  try {
    const result = await db.query(
      'SELECT id, name, email, role FROM users WHERE name = $1',
      [name]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    return res.json(result.rows[0]); // contient role
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur lors de la connexion" });
  }
});

// Recherche d'un user par nom
app.get('/api/users', async (req, res) => {
  const name = req.query.name;
  if (!name) return res.status(400).send('Name is required');

  try {
    const result = await db.query('SELECT id, name, role FROM users WHERE name = $1', [name]);
    if (result.rows.length === 0) return res.status(404).send('Utilisateur non trouvé');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur de récupération des utilisateurs');
  }
});

// ---- AVAILABILITY ----
app.get('/api/availability', async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];

  const query = `
    SELECT
      d.id AS desk_id,
      d.name AS desk_name,
      d.location,
      d.top_pct,
      d.left_pct,
      b.user_id,
      u.name AS user_name
    FROM desks d
    LEFT JOIN bookings b
      ON b.desk_id = d.id AND b.booking_date = $1
    LEFT JOIN users u
      ON u.id = b.user_id
    ORDER BY d.location, d.id;
  `;

  try {
    const result = await db.query(query, [date]);
    const data = result.rows.map(row => ({
      desk_id: row.desk_id,
      desk_name: row.desk_name,
      location: row.location,
      top_pct: row.top_pct,
      left_pct: row.left_pct,
      booked: !!row.user_id,
      user: row.user_id ? { id: row.user_id, name: row.user_name } : null
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur de récupération des disponibilités');
  }
});

// ---- BOOKINGS ----
app.post('/api/bookings', async (req, res) => {
  const { user_id, desk_id, booking_date } = req.body;
  const date = booking_date || new Date().toISOString().split('T')[0];

  try {
    const taken = await db.query(
      `SELECT 1 FROM bookings WHERE desk_id = $1 AND booking_date = $2 LIMIT 1;`,
      [desk_id, date]
    );
    if (taken.rows.length) return res.status(409).json({ error: 'Bureau déjà réservé' });

    const already = await db.query(
      `SELECT 1 FROM bookings WHERE user_id = $1 AND booking_date = $2 LIMIT 1;`,
      [user_id, date]
    );
    if (already.rows.length) return res.status(409).json({ error: 'Utilisateur a déjà une réservation ce jour' });

    const insert = await db.query(
      `INSERT INTO bookings (user_id, desk_id, booking_date) VALUES ($1, $2, $3) RETURNING id;`,
      [user_id, desk_id, date]
    );
    res.status(201).json({ id: insert.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur de création de réservation' });
  }
});

app.delete('/api/bookings', async (req, res) => {
  const { user_id, desk_id, booking_date } = req.body;
  const date = booking_date || new Date().toISOString().split('T')[0];

  try {
    await db.query(
      `DELETE FROM bookings WHERE user_id = $1 AND desk_id = $2 AND booking_date = $3;`,
      [user_id, desk_id, date]
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur de suppression de réservation' });
  }
});

// ---- ADMIN: update desk position ----
app.put('/api/desks/:id/position', async (req, res) => {
  const deskId = Number(req.params.id);
  const { user_id, top_pct, left_pct } = req.body;

  if (!user_id && user_id !== 0) {
    return res.status(400).json({ error: 'user_id requis' });
  }
  if (typeof top_pct !== 'number' || typeof left_pct !== 'number') {
    return res.status(400).json({ error: 'top_pct et left_pct doivent être numériques' });
  }
  if (top_pct < 0 || top_pct > 100 || left_pct < 0 || left_pct > 100) {
    return res.status(400).json({ error: 'top_pct/left_pct doivent être entre 0 et 100' });
  }

  try {
    const roleRes = await db.query('SELECT role FROM users WHERE id = $1', [user_id]);
    if (roleRes.rows.length === 0) return res.status(404).json({ error: 'Utilisateur inconnu' });
    if (roleRes.rows[0].role !== 'admin') return res.status(403).json({ error: 'Réservé aux admins' });

    const upd = await db.query(
      `UPDATE desks SET top_pct = $1, left_pct = $2 WHERE id = $3 RETURNING id, name, location, top_pct, left_pct;`,
      [top_pct, left_pct, deskId]
    );
    if (upd.rows.length === 0) return res.status(404).json({ error: 'Bureau introuvable' });

    return res.json(upd.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur de mise à jour de position' });
  }
});

// ---- ADMIN: delete any booking on a desk/date ----
app.delete('/api/admin/bookings', async (req, res) => {
  const { admin_user_id, desk_id, booking_date } = req.body;
  const date = booking_date || new Date().toISOString().split('T')[0];

  if (!admin_user_id) return res.status(400).json({ error: 'admin_user_id requis' });
  if (!desk_id) return res.status(400).json({ error: 'desk_id requis' });

  try {
    const roleRes = await db.query('SELECT role FROM users WHERE id = $1', [admin_user_id]);
    if (roleRes.rows.length === 0) return res.status(404).json({ error: 'Utilisateur inconnu' });
    if (roleRes.rows[0].role !== 'admin') return res.status(403).json({ error: 'Réservé aux admins' });

    await db.query(
      `DELETE FROM bookings WHERE desk_id = $1 AND booking_date = $2;`,
      [desk_id, date]
    );
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur admin lors de la suppression' });
  }
});

app.post('/api/admin/bookings', async (req, res) => {
  const { admin_user_id, target_user_id, desk_id, booking_date } = req.body;
  const date = booking_date || new Date().toISOString().split('T')[0];

  if (!admin_user_id || !target_user_id || !desk_id) {
    return res.status(400).json({ error: 'admin_user_id, target_user_id et desk_id requis' });
  }

  try {
    const roleRes = await db.query('SELECT role FROM users WHERE id = $1', [admin_user_id]);
    if (roleRes.rows.length === 0) return res.status(404).json({ error: 'Admin inconnu' });
    if (roleRes.rows[0].role !== 'admin') return res.status(403).json({ error: 'Réservé aux admins' });

    const taken = await db.query(
      `SELECT 1 FROM bookings WHERE desk_id = $1 AND booking_date = $2 LIMIT 1;`,
      [desk_id, date]
    );
    if (taken.rows.length) return res.status(409).json({ error: 'Bureau déjà réservé' });

    const already = await db.query(
      `SELECT 1 FROM bookings WHERE user_id = $1 AND booking_date = $2 LIMIT 1;`,
      [target_user_id, date]
    );
    if (already.rows.length) return res.status(409).json({ error: "L'utilisateur a déjà une réservation ce jour" });

    const insert = await db.query(
      `INSERT INTO bookings (user_id, desk_id, booking_date) VALUES ($1, $2, $3) RETURNING id;`,
      [target_user_id, desk_id, date]
    );
    return res.status(201).json({ id: insert.rows[0].id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur admin lors de la création' });
  }
});



// ---- ADMIN: create a new desk (centered) ----
app.post('/api/admin/desks', async (req, res) => {
  const { admin_user_id, location, top_pct = 50, left_pct = 50, name } = req.body;

  if (!admin_user_id || !location) {
    return res.status(400).json({ error: 'admin_user_id et location requis' });
  }
  if (typeof top_pct !== 'number' || typeof left_pct !== 'number') {
    return res.status(400).json({ error: 'top_pct et left_pct doivent être numériques' });
  }
  if (top_pct < 0 || top_pct > 100 || left_pct < 0 || left_pct > 100) {
    return res.status(400).json({ error: 'top_pct/left_pct doivent être entre 0 et 100' });
  }

  try {
    const roleRes = await db.query('SELECT role FROM users WHERE id = $1', [admin_user_id]);
    if (roleRes.rows.length === 0) return res.status(404).json({ error: 'Utilisateur inconnu' });
    if (roleRes.rows[0].role !== 'admin') return res.status(403).json({ error: 'Réservé aux admins' });

    // 1) Créer le desk
    const ins = await db.query(
      `INSERT INTO desks (name, location, top_pct, left_pct)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, location, top_pct, left_pct;`,
      [name || 'Desk', location, top_pct, left_pct]
    );
    const created = ins.rows[0];

    // 2) Si pas de nom fourni, renommer en "Desk {id}"
    if (!name || name === 'Desk') {
      const upd = await db.query(
        `UPDATE desks SET name = $1 WHERE id = $2 RETURNING id, name, location, top_pct, left_pct;`,
        [`Desk ${created.id}`, created.id]
      );
      return res.status(201).json(upd.rows[0]);
    }

    return res.status(201).json(created);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur admin lors de la création du desk' });
  }
});

// ---- ADMIN: remove a desk ----
app.delete('/api/admin/desks/:id', async (req, res) => {
  const { admin_user_id } = req.body;
  const deskId = Number(req.params.id);
  if (!admin_user_id) return res.status(400).json({ error: 'admin_user_id requis' });

  try {
    const roleRes = await db.query('SELECT role FROM users WHERE id = $1', [admin_user_id]);
    if (!roleRes.rows.length || roleRes.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Réservé aux admins' });
    }
    await db.query('DELETE FROM desks WHERE id = $1;', [deskId]);
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur admin lors de la suppression du desk' });
  }
});

// ---- USERS: liste complète (pour popup Collaborateurs) ----
app.get('/api/users/list', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role FROM users ORDER BY name ASC;');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du chargement des utilisateurs' });
  }
});

// ---- USERS: ajouter un collaborateur ----
app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Nom et email requis' });
  try {
    const result = await db.query(
      'INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING *;',
      [name, email, 'user']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l’ajout du collaborateur' });
  }
});


// ---- START ----
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
