function Sidebar({ user, onLogout, onAddDesk, onOpenCollaborators }) {
  const isAdmin = user?.role === 'admin';
  const initials = user.name.substring(0, 2).toUpperCase();

  return (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      background: 'var(--bg-panel)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{
        padding: '1.5rem 1.25rem 1.25rem',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          fontSize: '1.15rem',
          fontWeight: '800',
          letterSpacing: '0.06em',
          color: 'var(--accent)',
          textTransform: 'uppercase',
        }}>
          Chammas & Marcheteau
        </div>
        <div style={{
          fontSize: '0.72rem',
          color: 'var(--text-3)',
          marginTop: '3px',
          letterSpacing: '0.06em',
        }}>
          5 rue Ballu — Paris
        </div>
      </div>

      {/* User */}
      <div style={{
        padding: '1.1rem 1.25rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'var(--accent-dim)',
          border: '1px solid var(--border-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.82rem',
          fontWeight: '700',
          color: 'var(--accent)',
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text)' }}>
            {user.name}
          </div>
          {isAdmin && (
            <div style={{
              fontSize: '0.67rem',
              color: 'var(--accent)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginTop: '1px',
            }}>
              Admin
            </div>
          )}
        </div>
      </div>

      {/* Admin actions */}
      {isAdmin && (
        <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            fontSize: '0.67rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-3)',
            marginBottom: '2px',
          }}>
            Administration
          </div>
          <button onClick={onAddDesk} style={adminBtnStyle}>
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>＋</span>
            Ajouter une place
          </button>
          <button onClick={onOpenCollaborators} style={adminBtnStyle}>
            <span style={{ fontSize: '0.9rem' }}>👥</span>
            Équipe
          </button>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Logout */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-2)',
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: '0.83rem',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(52,159,155,0.5)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

const adminBtnStyle = {
  width: '100%',
  background: 'var(--accent-dim)',
  border: '1px solid var(--border-gold)',
  color: 'var(--accent)',
  padding: '0.48rem 0.75rem',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  fontSize: '0.81rem',
  textAlign: 'left',
  display: 'flex',
  alignItems: 'center',
  gap: '7px',
};

export default Sidebar;
