import { useEffect, useState } from 'react';
import {
  loginUser,
  fetchAvailability,
  bookDesk,
  deleteBooking,
  updateDeskPosition,
  deleteBookingAdmin,
  getUserByName,
  createBookingAdmin,
  createDeskAdmin,
  deleteDeskAdmin,
  fetchAllUsers,
  addUser,
  deleteUserAdmin
} from './services/api';

import Sidebar from './components/Sidebar';
import DeskMap from './components/DeskMap';
import CalendarPicker from './components/CalendarPicker';
import FloorSwitch from './components/FloorSwitch';

const floors = ['ballu5_rdj', 'ballu5_rdc', 'ballu5_r2', 'ballu5_r3', 'ballu5_r4'];

const floorAspectRatios = {
  ballu5_r2:  798 / 752,
  ballu5_r3:  798 / 752,
  ballu5_r4:  798 / 752,
  ballu5_rdc: 602 / 611,
  ballu5_rdj: 261 / 585,
};

const floorLabels = {
  ballu5_rdj: 'Rez-de-Jardin',
  ballu5_rdc: 'Rez-de-chaussée',
  ballu5_r2:  '2ème étage',
  ballu5_r3:  '3ème étage',
  ballu5_r4:  '4ème étage',
};

const deskLayouts = {
  'ballu5_r2': [
    { id: 1, top: '9%', left: '17%' },
    { id: 2, top: '18%', left: '17%' },
    { id: 3, top: '40%', left: '17%' },
    { id: 4, top: '55%', left: '17%' },
    { id: 5, top: '75%', left: '15%' },
    { id: 6, top: '75%', left: '22%' },
    { id: 7, top: '85%', left: '18%' },
    { id: 8, top: '85%', left: '26%' },
    { id: 9, top: '85%', left: '34%' },
    { id:10, top: '85%', left: '41%' },
  ],
  'ballu5_r3': [
    { id:11, top: '22%', left: '69%' },
    { id:12, top: '31%', left: '69%' },
    { id:13, top: '47%', left: '69%' },
    { id:14, top: '63%', left: '69%' },
    { id:15, top: '78%', left: '69%' },
    { id:16, top: '78%', left: '61%' },
  ],
  'ballu5_r4': [],
  'ballu5_rdc': [],
  'ballu5_rdj': [],
};

const LegendDot = ({ color, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
    <div style={{ width: '13px', height: '13px', borderRadius: '3px', background: color, flexShrink: 0 }} />
    <span style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>{label}</span>
  </div>
);

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [desks, setDesks] = useState([]);
  const [selectedDesk, setSelectedDesk] = useState(null);
  const [currentFloor, setCurrentFloor] = useState('ballu5_r2');
  const [showReserveDays, setShowReserveDays] = useState(false);
  const [reserveDaysDeskId, setReserveDaysDeskId] = useState(null);
  const [reserveDaysCount, setReserveDaysCount] = useState(10);
  const [reserveTargetName, setReserveTargetName] = useState(null);

  const [showCollaborators, setShowCollaborators] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

  const visibleDesks = desks.filter(d => d.location === currentFloor);
  const fallbackLayout = deskLayouts[currentFloor] || [];
  const floorImage = `/${currentFloor}.svg`;
  const freeCount = visibleDesks.filter(d => !d.booked).length;
  const fmt = (d) => d.toISOString().split('T')[0];

  const loadDesks = () =>
    fetchAvailability(selectedDate).then(res => setDesks(res.data)).catch(console.error);

  useEffect(() => { if (currentUser) loadDesks(); }, [currentUser, selectedDate, currentFloor]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(nameInput.trim());
      setCurrentUser(res.data);
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setDesks([]);
    setSelectedDesk(null);
  };

  const handleBooking = async (deskId) => {
    if (!currentUser) return;
    try {
      await bookDesk(currentUser.id, deskId, selectedDate);
      await loadDesks();
    } catch (err) {
      console.error(err);
      alert('Impossible de réserver');
    }
  };

  const handleDelete = async (deskId) => {
    if (!currentUser) return;
    try {
      await deleteBooking(currentUser.id, deskId, selectedDate);
      await loadDesks();
    } catch (err) {
      console.error(err);
      alert('Suppression impossible');
    }
  };

  const handlePositionChange = async (deskId, topPct, leftPct) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      await updateDeskPosition(deskId, topPct, leftPct, currentUser.id);
      await loadDesks();
    } catch (err) {
      console.error(err);
      alert("Mise à jour de position impossible");
    }
  };

  const handleAdminDelete = async (deskId) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      await deleteBookingAdmin(deskId, selectedDate, currentUser.id);
      await loadDesks();
    } catch (err) {
      console.error(err);
      alert("Libération (admin) impossible");
    }
  };

  const handleAdminAssign = async (deskId, targetName) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      const u = await getUserByName(targetName.trim());
      await createBookingAdmin(deskId, selectedDate, currentUser.id, u.data.id);
      await loadDesks();
    } catch (err) {
      console.error(err);
      const apiMsg =
        err?.response?.data?.error ||
        (err?.response?.status === 404 ? "Utilisateur non trouvé" : null) ||
        err?.message ||
        "Erreur inconnue";
      alert(`Assignment impossible : ${apiMsg}`);
    }
  };

  const handleAdminAddDesk = async () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      const res = await createDeskAdmin(currentUser.id, currentFloor, 50, 50);
      await loadDesks();
      const newId = res.data?.id;
      if (newId) setSelectedDesk(newId);
    } catch (err) {
      console.error(err);
      alert("Création de place impossible");
    }
  };

  const handleAdminRemoveDesk = async (deskId) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      await deleteDeskAdmin(deskId, currentUser.id);
      await loadDesks();
      setSelectedDesk(null);
    } catch (err) {
      console.error(err);
      alert("Suppression de la place impossible");
    }
  };

  const openCollaborators = async () => {
    try {
      const res = await fetchAllUsers();
      setCollaborators(res.data || []);
      setShowCollaborators(true);
    } catch (e) {
      console.error(e);
      alert("Impossible de charger les collaborateurs");
    }
  };

  const handleAddUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      alert("Nom et email requis");
      return;
    }
    try {
      await addUser(newUserName.trim(), newUserEmail.trim());
      setNewUserName('');
      setNewUserEmail('');
      setShowAddForm(false);
      if (showCollaborators) {
        const res = await fetchAllUsers();
        setCollaborators(res.data || []);
      }
    } catch (e) {
      console.error(e);
      alert("Impossible d'ajouter ce collaborateur");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    if (!window.confirm('Supprimer ce collaborateur et toutes ses réservations ?')) return;
    try {
      await deleteUserAdmin(userId, currentUser.id);
      const res = await fetchAllUsers();
      setCollaborators(res.data || []);
    } catch (e) {
      console.error(e);
      alert("Suppression impossible");
    }
  };

  const openReserveDays = (deskId, targetName = null) => {
    setReserveDaysDeskId(deskId);
    setReserveTargetName(targetName);
    setReserveDaysCount(10);
    setSelectedDesk(null);
    setShowReserveDays(true);
  };

  const handleBookingXDays = async (deskId, days, targetName = null) => {
    if (!currentUser) return;
    const n = Math.max(1, Math.min(260, parseInt(days, 10) || 0));
    try {
      let targetUserId = currentUser.id;
      if (currentUser.role === 'admin' && targetName?.trim()) {
        const u = await getUserByName(targetName.trim());
        targetUserId = u.data.id;
      }
      const start = new Date(selectedDate);
      const limit = new Date(start);
      limit.setFullYear(limit.getFullYear() + 1);
      const dates = [];
      const d = new Date(start);
      while (dates.length < n && d <= limit) {
        const day = d.getDay();
        if (day !== 0 && day !== 6) dates.push(fmt(d));
        d.setDate(d.getDate() + 1);
      }
      if (dates.length < n) alert("Impossible de réserver au-delà d'un an : la période a été tronquée.");
      let ok = 0, ko = 0;
      for (const dateStr of dates) {
        try { await bookDesk(targetUserId, deskId, dateStr); ok++; } catch { ko++; }
      }
      await loadDesks();
      setShowReserveDays(false);
      alert(`Réservations : ${ok} créées, ${ko} ignorées (conflits/week-ends/limite).`);
    } catch (err) {
      console.error(err);
      alert("Réservation X jours impossible");
    }
  };

  /* ─── Login ─────────────────────────────────────────────────────────────── */

  if (!currentUser) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% -5%, rgba(52,159,155,0.06) 0%, var(--bg) 65%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            fontSize: '0.72rem',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'var(--text-3)',
            marginBottom: '10px',
          }}>
            5 rue Ballu — Paris
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '2.6rem',
            fontWeight: '800',
            letterSpacing: '0.1em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
          }}>
            Résa Ballu
          </h1>
          <div style={{
            width: '60px',
            height: '2px',
            background: 'var(--accent)',
            margin: '14px auto 0',
            borderRadius: '1px',
            opacity: 0.5,
          }} />
        </div>

        <div style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          width: 'min(360px, 92vw)',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <h2 style={{
            margin: '0 0 1.5rem',
            fontSize: '0.95rem',
            fontWeight: '500',
            color: 'var(--text-2)',
            textAlign: 'center',
            letterSpacing: '0.04em',
          }}>
            Connexion
          </h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Vos initiales"
              autoFocus
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '0.7rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-gold)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
            <button
              type="submit"
              style={{
                background: 'var(--accent)',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '700',
                fontSize: '0.92rem',
                cursor: 'pointer',
                letterSpacing: '0.05em',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; }}
            >
              Entrer
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ─── App ────────────────────────────────────────────────────────────────── */

  const isAdmin = currentUser.role === 'admin';

  const computePosition = (desk) => {
    if (desk.top_pct != null && desk.left_pct != null)
      return { top: `${desk.top_pct}%`, left: `${desk.left_pct}%` };
    const f = fallbackLayout.find(x => x.id === desk.desk_id);
    return f ? { top: f.top, left: f.left } : { top: '0%', left: '0%' };
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      <Sidebar
        user={currentUser}
        onLogout={handleLogout}
        onAddDesk={handleAdminAddDesk}
        onOpenCollaborators={openCollaborators}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Top header bar */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.5rem',
          background: 'var(--bg-panel)',
          borderBottom: '1px solid var(--border)',
          gap: '1rem',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text)' }}>
              {floorLabels[currentFloor] || currentFloor}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '2px' }}>
              {freeCount} place{freeCount !== 1 ? 's' : ''} disponible{freeCount !== 1 ? 's' : ''}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <CalendarPicker selectedDate={selectedDate} onChange={setSelectedDate} />
            <FloorSwitch floors={floors} currentFloor={currentFloor} onChange={setCurrentFloor} />
          </div>
        </header>

        {/* Map area */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.25rem',
          overflow: 'hidden',
        }}>
          <DeskMap
            desks={visibleDesks.map(d => ({ ...d, ...computePosition(d) }))}
            layout={fallbackLayout}
            floorImage={floorImage}
            svgRatio={floorAspectRatios[currentFloor]}
            currentUser={currentUser}
            selectedDesk={selectedDesk}
            setSelectedDesk={setSelectedDesk}
            handleBooking={handleBooking}
            handleDelete={handleDelete}
            isAdmin={isAdmin}
            onDeskPositionChange={handlePositionChange}
            onAdminDelete={handleAdminDelete}
            onAdminAssign={handleAdminAssign}
            onAdminRemoveDesk={handleAdminRemoveDesk}
            onOpenReserveDays={openReserveDays}
          />
        </div>

        {/* Legend bar */}
        <footer style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          padding: '0.65rem 1.5rem',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-panel)',
          flexShrink: 0,
        }}>
          <LegendDot color="var(--desk-mine)" label="Ma place" />
          <LegendDot color="var(--desk-free)" label="Disponible" />
          <LegendDot color="var(--desk-taken)" label="Occupée" />
        </footer>
      </div>

      {/* ── Modal Collaborateurs ─────────────────────────────────────────────── */}
      {showCollaborators && (
        <div
          onClick={() => setShowCollaborators(false)}
          style={overlayStyle}
        >
          <div onClick={(e) => e.stopPropagation()} style={modalStyle}>
            <div style={modalHeaderStyle}>
              <span>Collaborateurs</span>
              <button
                onClick={() => setShowAddForm(true)}
                style={primaryBtnStyle}
              >
                + Ajouter
              </button>
            </div>

            <div style={{ padding: '6px 16px', overflowY: 'auto', flex: 1 }}>
              {collaborators.map(u => (
                <div
                  key={u.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{u.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>{u.email}</div>
                    {u.role !== 'admin' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteUser(u.id); }}
                        title="Supprimer"
                        style={{
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          color: '#ef4444',
                          padding: '2px',
                          lineHeight: 1,
                        }}
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {collaborators.length === 0 && (
                <div style={{ padding: '16px 0', color: 'var(--text-3)', fontSize: '0.88rem' }}>
                  Aucun collaborateur.
                </div>
              )}
            </div>

            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
              <button
                onClick={() => setShowCollaborators(false)}
                style={secondaryBtnStyle}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Ajout collaborateur ────────────────────────────────────────── */}
      {showAddForm && (
        <div onClick={() => setShowAddForm(false)} style={{ ...overlayStyle, zIndex: 1100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ ...modalStyle, maxWidth: '380px' }}>
            <div style={modalHeaderStyle}>
              <span>Ajouter un collaborateur</span>
            </div>
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Initiales"
                style={modalInputStyle}
              />
              <input
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="Email"
                style={modalInputStyle}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                <button onClick={() => setShowAddForm(false)} style={secondaryBtnStyle}>
                  Annuler
                </button>
                <button onClick={handleAddUser} style={primaryBtnStyle}>
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Réserver X jours ───────────────────────────────────────────── */}
      {showReserveDays && (
        <div onClick={() => setShowReserveDays(false)} style={{ ...overlayStyle, zIndex: 20000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ ...modalStyle, maxWidth: '360px' }}>
            <div style={modalHeaderStyle}>
              <span>Réserver X jours ouvrés</span>
            </div>
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="number"
                min={1}
                max={260}
                value={reserveDaysCount}
                onChange={(e) => setReserveDaysCount(e.target.value)}
                placeholder="Nombre de jours (max 260)"
                style={modalInputStyle}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                <button onClick={() => setShowReserveDays(false)} style={secondaryBtnStyle}>
                  Annuler
                </button>
                <button
                  onClick={() => handleBookingXDays(reserveDaysDeskId, reserveDaysCount, reserveTargetName)}
                  style={primaryBtnStyle}
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Shared modal styles ─────────────────────────────────────────────────── */

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(20,53,82,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)',
};

const modalStyle = {
  width: 'min(560px, 92vw)',
  maxHeight: '75vh',
  background: 'var(--bg-panel)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-lg)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const modalHeaderStyle = {
  padding: '14px 16px',
  borderBottom: '1px solid var(--border)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontWeight: '600',
  fontSize: '0.95rem',
  color: 'var(--text)',
};

const modalInputStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  padding: '0.55rem 0.75rem',
  borderRadius: 'var(--radius-sm)',
  fontSize: '0.9rem',
  outline: 'none',
  width: '100%',
};

const primaryBtnStyle = {
  background: 'var(--accent)',
  color: '#ffffff',
  border: 'none',
  padding: '0.45rem 1rem',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '0.85rem',
};

const secondaryBtnStyle = {
  background: 'transparent',
  border: '1px solid var(--border)',
  color: 'var(--text-2)',
  padding: '0.45rem 1rem',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  fontSize: '0.85rem',
};

export default App;
