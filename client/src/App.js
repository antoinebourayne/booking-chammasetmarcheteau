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
} from './services/api';

import Sidebar from './components/Sidebar';
import DeskMap from './components/DeskMap';
import CalendarPicker from './components/CalendarPicker';
import FloorSwitch from './components/FloorSwitch';

/** Liste des étages disponibles */
const floors = ['ballu5_r2', 'ballu5_r3', 'ballu5_r4', 'ballu5_rdc', 'ballu5_rdj'];

/** Fallback local des positions (si la DB n’a pas encore top/left pour un desk) */
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

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [desks, setDesks] = useState([]);
  const [selectedDesk, setSelectedDesk] = useState(null);
  const [currentFloor, setCurrentFloor] = useState('ballu5_r2');

  // Popup collaborateurs
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [collaborators, setCollaborators] = useState([]);

  // Popup ajout collaborateur
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

  const visibleDesks = desks.filter(d => d.location === currentFloor);
  const fallbackLayout = deskLayouts[currentFloor] || [];
  const floorImage = `/${currentFloor}.svg`;
  const fmt = (d) => d.toISOString().split('T')[0];

  const loadDesks = () =>
    fetchAvailability(selectedDate).then(res => setDesks(res.data)).catch(console.error);

  useEffect(() => { if (currentUser) loadDesks(); }, [currentUser, selectedDate, currentFloor]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(nameInput.trim());
      setCurrentUser(res.data); // contient role
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

  /** ADMIN: sauvegarde position en DB */
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

  /** ADMIN: libérer un bureau occupé par quelqu’un d’autre */
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

  /** ADMIN: assigner un user par nom */
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

  /** ADMIN: ajouter une place centrée (50%/50%) sur l’étage courant */
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

  /** ADMIN: retirer une place */
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

  /** Ouvrir / fermer popup Collaborateurs */
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
  const closeCollaborators = () => setShowCollaborators(false);

  /** Ajouter un collaborateur (depuis la popup dédiée) */
  const handleAddUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      alert("Nom et email requis");
      return;
    }
    try {
      await addUser(newUserName.trim(), newUserEmail.trim());
      setNewUserName('');
      setNewUserEmail('');
      setShowAddForm(false); // fermer la popup d'ajout
      // rafraîchir la liste si la popup Collaborateurs est ouverte
      if (showCollaborators) {
        const res = await fetchAllUsers();
        setCollaborators(res.data || []);
      }
    } catch (e) {
      console.error(e);
      alert("Impossible d’ajouter ce collaborateur");
    }
  };

  const handleBookingSixMonths = async (deskId, targetName) => {
    if (!currentUser) return;
  
    try {
      // Détermine l'user cible : soi-même, ou (admin) le collaborateur saisi
      let targetUserId = currentUser.id;
      if (currentUser.role === 'admin' && targetName?.trim()) {
        const u = await getUserByName(targetName.trim());
        targetUserId = u.data.id;
      }
  
      const start = new Date(selectedDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 6);
  
      const dates = [];
      const d = new Date(start);
      while (d <= end) {
        const day = d.getDay(); // 0=dim, 6=sam
        if (day !== 0 && day !== 6) dates.push(fmt(d));
        d.setDate(d.getDate() + 1);
      }
  
      let ok = 0, ko = 0;
      for (const dateStr of dates) {
        try {
          await bookDesk(targetUserId, deskId, dateStr);
          ok++;
        } catch {
          ko++; // conflit / déjà réservé => on continue
        }
      }
  
      await loadDesks();
      alert(`Réservations sur ~6 mois : ${ok} créées, ${ko} ignorées (conflits/week-ends).`);
    } catch (err) {
      console.error(err);
      alert("Réservation 6 mois impossible");
    }
  };

  if (!currentUser) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Titre au-dessus de la carte de connexion */}
        <h1
          style={{
            marginBottom: '1.5rem',
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1f2937',
            textAlign: 'center'
          }}
        >
          Résa Ballu
        </h1>

        <div style={{
          padding: '2rem',
          border: '1px solid #ddd',
          borderRadius: '12px',
          background: 'white',
          boxShadow: '0 4px 18px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Connexion</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Votre nom"
              style={{ padding: '0.5rem 0.75rem' }}
            />
            <button type="submit">Se connecter</button>
          </form>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser.role === 'admin';

  const computePosition = (desk) => {
    if (desk.top_pct != null && desk.left_pct != null) {
      return { top: `${desk.top_pct}%`, left: `${desk.left_pct}%` };
    }
    const f = fallbackLayout.find(x => x.id === desk.desk_id);
    return f ? { top: f.top, left: f.left } : { top: '0%', left: '0%' };
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        user={currentUser}
        onLogout={handleLogout}
        onAddDesk={handleAdminAddDesk}
        onOpenCollaborators={openCollaborators}
      />

      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <CalendarPicker selectedDate={selectedDate} onChange={setSelectedDate} />

        {/* Sélecteur d’étage centré */}
        <div style={{ textAlign: 'center', margin: '1rem 0' }}>
          <FloorSwitch
            floors={floors}
            currentFloor={currentFloor}
            onChange={(val) => setCurrentFloor(val)}
          />
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <DeskMap
            desks={visibleDesks.map(d => ({ ...d, ...computePosition(d) }))}
            layout={fallbackLayout}
            floorImage={floorImage}
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
            handleBookingSixMonths={handleBookingSixMonths}
          />
        </div>
      </div>

      {/* Popup Collaborateurs */}
      {showCollaborators && (
        <div
          onClick={closeCollaborators}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(600px, 90vw)',
              maxHeight: '70vh',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ fontWeight: 'bold' }}>Collaborateurs</div>
              <button
                onClick={() => setShowAddForm(true)}
                style={{
                  backgroundColor: '#22c55e',
                  color: 'white',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Ajouter
              </button>
            </div>

            <div style={{ padding: '8px 16px', overflowY: 'auto' }}>
              {collaborators.map(u => (
                <div
                  key={u.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid #f2f2f2'
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{u.name}</div>
                  <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>{u.email}</div>
                </div>
              ))}

              {collaborators.length === 0 && (
                <div style={{ padding: '16px 0', opacity: 0.7 }}>Aucun collaborateur.</div>
              )}
            </div>

            <div style={{ padding: '10px 16px', borderTop: '1px solid #eee', textAlign: 'right' }}>
              <button onClick={closeCollaborators} style={{ padding: '6px 12px' }}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup AJOUT Collaborateur */}
      {showAddForm && (
        <div
          onClick={() => setShowAddForm(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(420px, 95vw)',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>Ajouter un collaborateur</div>

            <input
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="Nom"
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
            />
            <input
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="Email"
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button onClick={() => setShowAddForm(false)} style={{ padding: '6px 10px' }}>
                Annuler
              </button>
              <button
                onClick={handleAddUser}
                style={{
                  padding: '6px 10px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
