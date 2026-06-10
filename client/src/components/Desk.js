import React, { useState } from 'react';

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

  return (
    <div
      onClick={() => canOpen && onSelect(desk.id)}
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

      {/* Popup bureau libre */}
      {!booked && isSelected && (
        <div style={popupStyle} onClick={(e) => e.stopPropagation()}>
          {isAdmin && (
            <input
              value={assignName}
              onChange={(e) => setAssignName(e.target.value)}
              placeholder="Initiales collaborateur"
              style={inputStyle}
            />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isAdmin) {
                if (assignName.trim() && typeof onAdminAssign === 'function') {
                  onAdminAssign(desk.id, assignName.trim());
                  setAssignName('');
                } else {
                  alert("Entrez un nom (existant en base) pour réserver pour un collaborateur.");
                }
              } else {
                onBook(desk.id);
              }
            }}
            style={actionBtnStyle}
          >
            Réserver aujourd'hui
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (typeof onOpenReserveDays === 'function') {
                if (isAdmin) {
                  if (!assignName.trim()) {
                    alert("Entrez un nom (existant en base) pour réserver pour un collaborateur.");
                    return;
                  }
                  onOpenReserveDays(desk.id, assignName.trim());
                  setAssignName('');
                } else {
                  onOpenReserveDays(desk.id);
                }
              }
            }}
            style={actionBtnStyle}
          >
            Réserver X jours
          </button>
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (typeof onAdminRemoveDesk === 'function') onAdminRemoveDesk(desk.id);
              }}
              style={dangerBtnStyle}
            >
              Retirer la place
            </button>
          )}
        </div>
      )}

      {/* Popup bureau réservé par moi */}
      {isSelected && booked && isCurrentUser && (
        <div style={popupStyle} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(desk.id); }}
            style={dangerBtnStyle}
          >
            Annuler ma réservation
          </button>
        </div>
      )}

      {/* Popup bureau réservé par quelqu'un d'autre (admin) */}
      {isSelected && booked && !isCurrentUser && isAdmin && (
        <div style={popupStyle} onClick={(e) => e.stopPropagation()}>
          {userName && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-2)', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
              Réservé par <strong style={{ color: 'var(--text)' }}>{userName}</strong>
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); if (typeof onAdminDelete === 'function') onAdminDelete(desk.id); }}
            style={dangerBtnStyle}
          >
            Libérer cette place
          </button>
        </div>
      )}
    </div>
  );
}

const popupStyle = {
  position: 'absolute',
  top: '120%',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'var(--bg-panel)',
  border: '1px solid var(--border-gold)',
  borderRadius: '10px',
  padding: '10px',
  boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
  whiteSpace: 'nowrap',
  zIndex: 99999,
  minWidth: '170px',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const inputStyle = {
  width: '100%',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  padding: '0.35rem 0.5rem',
  borderRadius: '5px',
  fontSize: '0.78rem',
  outline: 'none',
};

const actionBtnStyle = {
  width: '100%',
  background: 'var(--accent-dim)',
  border: '1px solid var(--border-gold)',
  color: 'var(--accent)',
  padding: '0.38rem 0.6rem',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.8rem',
  textAlign: 'center',
  fontWeight: '500',
};

const dangerBtnStyle = {
  width: '100%',
  background: 'rgba(239,68,68,0.1)',
  border: '1px solid rgba(239,68,68,0.3)',
  color: '#f87171',
  padding: '0.38rem 0.6rem',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.8rem',
  textAlign: 'center',
  fontWeight: '500',
};

export default Desk;
