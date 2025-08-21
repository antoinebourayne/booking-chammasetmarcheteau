function Sidebar({ user, onLogout, onAddDesk, onOpenCollaborators }) {
  const isAdmin = user?.role === 'admin';

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
        <h3 style={{ margin: 0 }}>{user.name}</h3>
        {isAdmin && (
          <>
            <div style={{ marginTop: '4px', fontSize: '0.85rem', opacity: 0.9 }}>
              admin
            </div>

            {/* Bouton ajouter une place (admin uniquement) */}
            <button
              onClick={onAddDesk}
              style={{
                marginTop: '0.75rem',
                width: '100%',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.5rem',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Ajouter une place
            </button>
            {/* Bouton Collaborateurs (admin uniquement) */}
            <button
              onClick={onOpenCollaborators}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.5rem',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Collaborateurs
            </button>
          </>
        )}
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
