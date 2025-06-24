function Sidebar({ user, onLogout }) {
    return (
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
          <h3>{user.name}</h3>
        </div>
        <button onClick={onLogout} style={{
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
    );
  }
  export default Sidebar;
  