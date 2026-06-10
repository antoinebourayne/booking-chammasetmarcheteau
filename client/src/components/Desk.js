import React, { useState } from 'react';
import ReactDOM from 'react-dom';

function Desk({
  desk,
  booked,
  userName,
  currentUser,
  isSelected,
  onSelect,
  onDelete,
  isAdmin = false,
  onAdminDelete,
  onAdminAssign,
  onAdminRemoveDesk,
  onOpenReserveDays,
  onBook
}) {
  const [assignName, setAssignName] = useState('');
  const isCurrentUser = userName === currentUser.name;
  const canOpen = !booked || isCurrentUser || isAdmin;

  const bgColor = booked
    ? (isCurrentUser ? 'var(--desk-mine)' : 'var(--desk-taken)')
    : 'var(--desk-free)';

  const textColor = booked
    ? (isCurrentUser ? '#4a3800' : '#ffffff')
    : '#143552';

  const borderColor = booked
    ? (isCurrentUser ? 'rgba(180,140,0,0.5)' : 'rgba(0,0,0,0.15)')
    : 'rgba(52,159,155,0.4)';

  const glowColor = booked
    ? (isCurrentUser ? 'rgba(180,140,0,0.25)' : 'none')
    : 'rgba(52,159,155,0.15)';

  const close = (e) => {
    e?.stopPropagation();
    onSelect(null);
    setAssignName('');
  };

  const modalTitle = booked
    ? (isCurrentUser ? 'Ma réservation' : `Réservé par ${userName || '—'}`)
    : 'Bureau disponible';

  const modal = isSelected && (
    ReactDOM.createPortal(
      <div style={backdropStyle} onClick={close}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div style={headerStyle}>
            <span style={titleStyle}>{modalTitle}</span>
            <button style={closeBtnStyle} onClick={close} aria-label="Fermer">×</button>
          </div>

          {/* Contenu */}
          <div style={bodyStyle}>
            {/* Bureau libre */}
            {!booked && (
              <>
                {isAdmin && (
                  <input
                    value={assignName}
                    onChange={(e) => setAssignName(e.target.value)}
                    placeholder="Initiales collaborateur"
                    style={inputStyle}
                    autoFocus
                  />
                )}
                <button
                  style={actionBtnStyle}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isAdmin) {
                      if (assignName.trim() && typeof onAdminAssign === 'function') {
                        onAdminAssign(desk.id, assignName.trim());
                        setAssignName('');
                        close();
                      }
                    } else {
                      onBook(desk.id);
                      close();
                    }
                  }}
                >
                  Réserver aujourd'hui
                </button>
                <button
                  style={actionBtnStyle}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (typeof onOpenReserveDays === 'function') {
                      if (isAdmin) {
                        if (!assignName.trim()) return;
                        onOpenReserveDays(desk.id, assignName.trim());
                        setAssignName('');
                      } else {
                        onOpenReserveDays(desk.id);
                      }
                      close();
                    }
                  }}
                >
                  Réserver X jours
                </button>
                {isAdmin && (
                  <button
                    style={dangerBtnStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (typeof onAdminRemoveDesk === 'function') onAdminRemoveDesk(desk.id);
                      close();
                    }}
                  >
                    Retirer la place
                  </button>
                )}
              </>
            )}

            {/* Bureau réservé par moi */}
            {booked && isCurrentUser && (
              <button
                style={dangerBtnStyle}
                onClick={(e) => { e.stopPropagation(); onDelete(desk.id); close(); }}
              >
                Annuler ma réservation
              </button>
            )}

            {/* Bureau réservé par quelqu'un d'autre (admin) */}
            {booked && !isCurrentUser && isAdmin && (
              <button
                style={dangerBtnStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  if (typeof onAdminDelete === 'function') onAdminDelete(desk.id);
                  close();
                }}
              >
                Libérer cette place
              </button>
            )}
          </div>
        </div>
      </div>,
      document.body
    )
  );

  return (
    <>
      <div
        onClick={() => canOpen && onSelect(isSelected ? null : desk.id)}
        title={booked ? (userName ? `Réservé par ${userName}` : 'Réservé') : 'Disponible'}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: '5px 5px 4px 4px',
          background: bgColor,
          border: `1px solid ${borderColor}`,
          boxShadow: booked ? 'none' : `0 0 10px ${glowColor}`,
          color: textColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.6rem',
          fontWeight: '700',
          cursor: canOpen ? 'pointer' : 'not-allowed',
          padding: '2px',
          textAlign: 'center',
          transition: 'opacity 0.15s',
          overflow: 'visible',
          outline: isSelected ? '2px solid var(--accent)' : 'none',
          outlineOffset: '2px',
        }}
        onMouseEnter={e => { if (canOpen && !isSelected) e.currentTarget.style.opacity = '0.82'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        {booked && userName && (
          <span style={{
            maxWidth: '90%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            letterSpacing: '0.02em',
          }}>
            {userName}
          </span>
        )}
      </div>
      {modal}
    </>
  );
}

const backdropStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(14, 36, 56, 0.50)',
  backdropFilter: 'blur(3px)',
  WebkitBackdropFilter: 'blur(3px)',
  zIndex: 99999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const modalStyle = {
  background: 'var(--bg-panel)',
  border: '1px solid var(--border-gold)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
  width: '300px',
  maxWidth: '90vw',
  overflow: 'hidden',
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 16px 12px',
  borderBottom: '1px solid var(--border)',
};

const titleStyle = {
  fontSize: '0.88rem',
  fontWeight: '600',
  color: 'var(--text)',
  letterSpacing: '0.01em',
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-3)',
  fontSize: '1.3rem',
  lineHeight: 1,
  padding: '0 2px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color 0.15s',
};

const bodyStyle = {
  padding: '14px 16px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const inputStyle = {
  width: '100%',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  padding: '0.42rem 0.6rem',
  borderRadius: '6px',
  fontSize: '0.82rem',
  outline: 'none',
};

const actionBtnStyle = {
  width: '100%',
  background: 'var(--accent-dim)',
  border: '1px solid var(--border-gold)',
  color: 'var(--accent)',
  padding: '0.48rem 0.7rem',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.83rem',
  textAlign: 'center',
  fontWeight: '500',
  transition: 'background 0.15s',
};

const dangerBtnStyle = {
  width: '100%',
  background: 'rgba(239,68,68,0.07)',
  border: '1px solid rgba(239,68,68,0.25)',
  color: '#ef4444',
  padding: '0.48rem 0.7rem',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.83rem',
  textAlign: 'center',
  fontWeight: '500',
  transition: 'background 0.15s',
};

export default Desk;
