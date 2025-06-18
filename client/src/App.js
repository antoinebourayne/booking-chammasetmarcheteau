import { useEffect, useState } from 'react';
import axios from 'axios';

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

  const fetchDesks = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/availability`)
      .then(res => setDesks(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (currentUser) fetchDesks();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>Se connecter</h2>
        <input
          type="text"
          placeholder="Nom"
          value={loginName}
          onChange={(e) => setLoginName(e.target.value)}
        />
        <button
          onClick={() => {
            axios
              .get(`${process.env.REACT_APP_API_URL}/api/users?name=${encodeURIComponent(loginName)}`)
              .then(res => {
                setCurrentUser(res.data);
                setError('');
              })
              .catch(() => setError("Utilisateur non trouvé"));
          }}
        >
          Valider
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  const handleBooking = async (deskId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/bookings`, {
        user_id: currentUser.id,
        desk_id: deskId
      });
      setSelectedDesk(null);
      fetchDesks();
    } catch (err) {
      alert('Erreur : ce bureau est déjà réservé');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <div style={{
    width: '200px',
    backgroundColor: '#333',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '1rem'
  }}>
    <div>
      <h3>{currentUser.name}</h3>
    </div>
    <button 
      onClick={() => {
        setCurrentUser(null);
        setLoginName('');
        setError('');
      }}
    style={{
      backgroundColor: '#555',
      color: 'white',
      border: 'none',
      padding: '0.5rem',
      cursor: 'pointer',
      width: '100%'
    }}>
      Se déconnecter
    </button>
  </div>

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          width: 800,
          height: 600,
          margin: '2rem auto',
          overflow: 'hidden',
          backgroundColor: '#DAD0D0'
        }}
      >
        <img
          src="/ballu5.svg"
          alt="Floor Plan"
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />

        {deskLayout.map(desk => {
          const status = desks.find(d => d.desk_id === desk.id);
          const booked = status?.booked;
          const userName = status?.user?.name;
          const isSelected = selectedDesk === desk.id;

          return (
            <div
              key={desk.id}
              onClick={() => !booked && setSelectedDesk(desk.id)}
              style={{
                position: 'absolute',
                top: desk.top,
                left: desk.left,
                width: '5%',
                height: '4%',
                backgroundColor: booked ? 'gray' : 'lightgreen',
                border: '2px solid black',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '0.7rem',
                color: 'black',
                textAlign: 'center',
                padding: '2px',
                cursor: booked ? 'default' : 'pointer'
              }}
            >
              {booked ? userName : ''}
              {isSelected && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBooking(desk.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '110%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'white',
                    border: '1px solid black',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    zIndex: 2
                  }}
                >
                  Réserver
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
