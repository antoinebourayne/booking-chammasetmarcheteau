import { useEffect, useState } from 'react';
import { loginUser, fetchAvailability, bookDesk, deleteBooking } from './services/api';
import Sidebar from './components/Sidebar';
import DeskMap from './components/DeskMap';
import CalendarPicker from './components/CalendarPicker';

const deskLayout = [
  { id: 1, top: '9%', left: '16%' },
  { id: 2, top: '18%', left: '16%' },
  { id: 3, top: '40%', left: '16%' },
  { id: 4, top: '55%', left: '16%' },
  { id: 5, top: '75%', left: '14%' },
  { id: 6, top: '75%', left: '21%' },
  { id: 7, top: '85%', left: '18%' },
  { id: 8, top: '14%', left: '30%' },
  { id: 9, top: '14%', left: '43%' },
  { id: 10, top: '14%', left: '60%' },
  { id: 11, top: '8%', left: '76%' },
  { id: 12, top: '45%', left: '35%' },
  { id: 13, top: '55%', left: '35%' },
  { id: 14, top: '48%', left: '61%' },
];

function App() {
  const [desks, setDesks] = useState([]);
  const [selectedDesk, setSelectedDesk] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginName, setLoginName] = useState('');
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const loadDesks = () => fetchAvailability(selectedDate).then(res => setDesks(res.data)).catch(console.error);

  useEffect(() => { if (currentUser) loadDesks(); }, [currentUser, selectedDate]);

  const handleLogin = () => {
    loginUser(loginName)
      .then(res => { setCurrentUser(res.data); setError(''); })
      .catch(err => setError(err.response?.data?.error || "Erreur de connexion"));
  };

  const handleBooking = async (deskId) => {
    try {
      await bookDesk(currentUser.id, deskId, selectedDate);
      setSelectedDesk(null);
      loadDesks();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la réservation');
    }
  };
  
  const handleDeleteBooking = async (deskId) => {
    try {
      await deleteBooking(currentUser.id, deskId, selectedDate);
      setSelectedDesk(null);
      loadDesks();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l’annulation');
    }
  };  

  if (!currentUser) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>Se connecter</h2>
        <input value={loginName} onChange={e => setLoginName(e.target.value)} placeholder="Nom" />
        <button onClick={handleLogin}>Valider</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <CalendarPicker selectedDate={selectedDate} onChange={setSelectedDate} />
      <div style={{ display: 'flex', width: '100%' }}>
        <Sidebar
          user={currentUser}
          onLogout={() => {
            setCurrentUser(null);
            setLoginName('');
            setError('');
          }}
        />
        <DeskMap
          desks={desks}
          layout={deskLayout}
          currentUser={currentUser}
          selectedDesk={selectedDesk}
          setSelectedDesk={setSelectedDesk}
          handleBooking={handleBooking}
          handleDelete={handleDeleteBooking}
        />
      </div>
      {error && (
        <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>
      )}
    </div>
  );
}

export default App;