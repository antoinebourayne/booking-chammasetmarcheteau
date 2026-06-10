# booking-chammasetmarcheteau — Résa Ballu

Application de réservation de bureaux pour les locaux de Chammas & Marcheteau (5 rue Ballu, Paris).

## Lancer le projet

```bash
docker-compose up --build
```

- Frontend React : http://localhost:3000
- API Express    : http://localhost:3001
- PostgreSQL     : localhost:5432

Arrêter : `docker-compose down`  
Tout reset (données comprises) : `docker-compose down -v`

## Architecture

```
/
├── docker-compose.yml      # 3 services : db, server, client
├── client/                 # React (Create React App)
│   └── src/
│       ├── App.js          # Tout l'état global, tous les handlers
│       ├── services/api.js # Client Axios (baseURL = REACT_APP_API_URL)
│       └── components/
│           ├── Desk.js         # Bouton bureau + popup actions
│           ├── DeskMap.js      # Plan d'étage, drag-and-drop (admin)
│           ├── Sidebar.js      # Colonne gauche (nom user, boutons admin)
│           ├── CalendarPicker.js
│           └── FloorSwitch.js
└── server/
    ├── index.js            # Routes Express
    ├── db.js               # Pool pg
    └── init.sql            # Schéma + seed
```

## Base de données

Tables : `users`, `desks`, `bookings`

- **users** : id, name, email, role (`'user'` | `'admin'`)
- **desks** : id, name, location (étage), top_pct, left_pct (position en %)
- **bookings** : id, user_id, desk_id, booking_date — unique par (desk, date) et (user, date)

Seed par défaut : utilisateurs JX, HX, MX, NX, LC (admin). 16 bureaux répartis sur r2 et r3.

## Étages

`ballu5_rdj` · `ballu5_rdc` · `ballu5_r2` · `ballu5_r3` · `ballu5_r4`

Les plans sont servis comme images SVG depuis `client/public/<étage>.svg`.
Les positions des bureaux (top_pct / left_pct) sont stockées en DB ; si nulles, le front utilise un fallback codé en dur dans `App.js`.

## Auth

Login par nom uniquement (pas de mot de passe). Le nom doit correspondre à `users.name` en base.

## API — routes principales

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/login` | Connexion par nom |
| GET | `/api/availability?date=` | Tous les bureaux + statut réservation |
| POST | `/api/bookings` | Réserver un bureau |
| DELETE | `/api/bookings` | Annuler sa réservation |
| PUT | `/api/desks/:id/position` | Admin : déplacer un bureau |
| POST | `/api/admin/bookings` | Admin : réserver pour quelqu'un |
| DELETE | `/api/admin/bookings` | Admin : libérer n'importe quelle résa |
| POST | `/api/admin/desks` | Admin : créer un bureau |
| DELETE | `/api/admin/desks/:id` | Admin : supprimer un bureau |
| GET | `/api/users/list` | Liste de tous les utilisateurs |
| POST | `/api/users` | Ajouter un collaborateur |
| DELETE | `/api/admin/users/:id` | Admin : supprimer un collaborateur |

## Variables d'environnement

Côté serveur (définies dans `docker-compose.yml`) :
- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_PORT`

Côté client :
- `REACT_APP_API_URL` — URL de l'API (ex: `http://localhost:3001`)

## Fonctionnalités admin

Le rôle `admin` donne accès à :
- Glisser-déposer les bureaux sur le plan (position sauvegardée en DB)
- Réserver / libérer un bureau pour n'importe quel collaborateur
- Ajouter / supprimer des bureaux
- Gérer la liste des collaborateurs (ajout, suppression)
