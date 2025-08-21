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
  onBookSixMonths,
  onBook
}) {
  const [assignName, setAssignName] = useState('');
  const isCurrentUser = userName === currentUser.name;
  const canOpen = !booked || isCurrentUser || isAdmin;

  return (
    <div
      onClick={() => canOpen && onSelect(desk.id)}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: '6px',
        backgroundColor: booked
          ? (isCurrentUser ? '#3b82f6' : '#9ca3af')
          : '#22c55e',
        color: booked ? (isCurrentUser ? 'white' : 'black') : 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.7rem',
        cursor: canOpen ? 'pointer' : 'not-allowed',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        padding: '2px',
        textAlign: 'center'
      }}
      title={booked ? (userName ? `Réservé par ${userName}` : 'Réservé') : 'Disponible'}
    >
      {booked && userName && (
        <div
          title={userName}
          style={{
            fontSize: '0.75rem',
            fontWeight: isCurrentUser ? 'bold' : 'normal',
            color: isCurrentUser ? 'white' : 'black',
            maxWidth: '64px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.1
          }}
        >
          {userName}
        </div>
      )}

      {/* Bureau libre : Réserver + (admin) assigner quelqu’un */}
      {!booked && isSelected && (
        <div style={popupStyle} onClick={(e) => e.stopPropagation()}>
          {isAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                value={assignName}
                onChange={(e) => setAssignName(e.target.value)}
                placeholder="Nom du collaborateur"
                style={{ width: '120px', fontSize: '0.75rem', padding: '2px 6px' }}
              />   
            </div>
            
          )}
            <div
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
              style={{
                cursor: 'pointer',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '0.35rem 0.6rem',
                textAlign: 'center',
                marginBottom: isAdmin ? '8px' : 0
              }}
            >
              Réserver aujourd'hui
            </div>

          <div
              onClick={(e) => {
                e.stopPropagation();
                if (isAdmin) {
                  if (assignName.trim() && typeof onBookSixMonths === 'function') {
                    onBookSixMonths(desk.id, assignName.trim());
                    setAssignName('');
                  } else {
                    alert("Entrez un nom (existant en base) pour réserver pour un collaborateur.");
                  }
                } else {
                  if (typeof onBookSixMonths === 'function') onBookSixMonths(desk.id);
                }
              }}
              
              style={{
                cursor: 'pointer',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '0.35rem 0.6rem',
                textAlign: 'center'
              }}
            >
              Réserver 6 mois
        </div>
          {isAdmin && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (typeof onAdminRemoveDesk === 'function') onAdminRemoveDesk(desk.id);
              }}
              style={{
                cursor: 'pointer',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '0.35rem 0.6rem',
                textAlign: 'center',
                marginBottom: '8px'
              }}
            >
              Retirer la place
            </div>
          )}
          
        </div>
      )}

      {/* Bureau réservé par moi : supprimer ma résa */}
      {isSelected && booked && isCurrentUser && (
        <div
          style={popupStyle}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(desk.id);
          }}
        >
          Supprimer
        </div>
      )}

      {/* Bureau réservé par quelqu’un d’autre : admin peut libérer */}
      {isSelected && booked && !isCurrentUser && isAdmin && (
        <div
          style={popupStyle}
          onClick={(e) => {
            e.stopPropagation();
            if (typeof onAdminDelete === 'function') onAdminDelete(desk.id);
          }}
        >
          Libérer
        </div>
      )}
    </div>
  );
}

const popupStyle = {
  position: 'absolute',
  top: '110%',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'white',
  color: '#111',
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '0.35rem 0.6rem',
  boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
  whiteSpace: 'nowrap',
  zIndex: 10000
};

export default Desk;
