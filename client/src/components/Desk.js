function Desk({ desk, booked, userName, currentUser, isSelected, onSelect, onBook, onDelete }) {
    const isCurrentUser = userName === currentUser.name;
  
    return (
      <div
        onClick={() => (!booked || isCurrentUser) && onSelect(desk.id)}
        style={{
          position: 'absolute',
          top: desk.top,
          left: desk.left,
          width: '5%',
          height: '4%',
          backgroundColor: booked 
            ? isCurrentUser
              ? 'lightblue'
              : 'gray'
           : 'lightgreen',
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
          cursor: booked && !isCurrentUser ? 'default' : 'pointer'
        }}
      >
        {booked ? userName : ''}
        {isSelected && !booked && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onBook(desk.id);
            }}
            style={popupStyle}
          >
            Réserver
          </div>
        )}
        {isSelected && booked && isCurrentUser && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onDelete(desk.id);
            }}
            style={popupStyle}
          >
            Supprimer
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
    border: '1px solid black',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '0.7rem',
    cursor: 'pointer',
    zIndex: 2
  };
  
  export default Desk;
  