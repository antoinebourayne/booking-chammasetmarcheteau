import { useEffect, useState } from 'react';
import { loginUser, fetchAvailability, bookDesk, deleteBooking } from './services/api';
import Sidebar from './components/Sidebar';
import DeskMap from './components/DeskMap';
import CalendarPicker from './components/CalendarPicker';
import FloorSwitch from './components/FloorSwitch';

const deskLayouts = {
  'ballu5_r2': [
  { id: 1, top: '9%', left: '13%' },
  { id: 2, top: '18%', left: '13%' },
  { id: 3, top: '40%', left: '14%' },
  { id: 4, top: '55%', left: '14%' },
  { id: 5, top: '75%', left: '14%' },
  { id: 6, top: '75%', left: '17%' },
  { id: 7, top: '85%', left: '12%' },
  { id: 8, top: '14%', left: '27%' },
  { id: 9, top: '14%', left: '43%' },
  { id: 10, top: '14%', left: '60%' },
  { id: 11, top: '8%', left: '80%' },
  { id: 12, top: '45%', left: '35%' },
  { id: 13, top: '55%', left: '35%' },
  { id: 14, top: '48%', left: '61%' },
  ],
  'ballu5_r3': [
  { id: 15, top: '9%', left: '13%' },
  { id: 16, top: '40%', left: '13%' },
  { id: 17, top: '55%', left: '13%' },
  { id: 18, top: '80%', left: '15%' },
  ]
};

function App() {
  const [desks, setDesks] = useState([]);
  const [selectedDesk, setSelectedDesk] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginName, setLoginName] = useState('');
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentFloor, setCurrentFloor] = useState('ballu5_r2');
  const visibleDesks = desks.filter(d => d.location === currentFloor);
  const visibleLayout = deskLayouts[currentFloor];
  const floorImage = `/${currentFloor}.svg`;
  const toggleFloor = () =>
  setCurrentFloor(prev => (prev === 'ballu5_r2' ? 'ballu5_r3' : 'ballu5_r2'));



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
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        user={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          setLoginName('');
          setError('');
        }}
      />
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Top UI: FloorSwitch center, CalendarPicker right */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 2rem',
          zIndex: 3
        }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <FloorSwitch currentFloor={currentFloor} onSwitch={toggleFloor} />
          </div>
          <div>
            <CalendarPicker selectedDate={selectedDate} onChange={setSelectedDate} />
          </div>
        </div>
  
        {/* Center: DeskMap */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          paddingTop: '5rem'
        }}>
          <DeskMap
            desks={visibleDesks}
            layout={visibleLayout}
            floorImage={floorImage}
            currentUser={currentUser}
            selectedDesk={selectedDesk}
            setSelectedDesk={setSelectedDesk}
            handleBooking={handleBooking}
            handleDelete={handleDeleteBooking}
          />
        </div>
  
        {/* Error Message */}
        {error && (
          <p style={{ color: 'red', position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)' }}>{error}</p>
        )}
      </div>
    </div>
  );
}

export default App;