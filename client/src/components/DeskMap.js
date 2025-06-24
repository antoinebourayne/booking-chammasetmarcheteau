import Desk from './Desk';

function DeskMap({ desks, layout, floorImage, currentUser, selectedDesk, setSelectedDesk, handleBooking, handleDelete, children }) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: '1000px',
      height: '80vh',
      margin: '0 auto',
      paddingTop: '4rem',
      overflow: 'hidden',
      backgroundColor: '#DAD0D0'
    }}>
      {children}
      <img
        src={floorImage}
        alt="Floor Plan"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0
        }}
      />
      {layout.map(desk => {
        const status = desks.find(d => d.desk_id === desk.id);
        const booked = status?.booked;
        const userName = status?.user?.name;

        return (
          <Desk
            key={desk.id}
            desk={desk}
            booked={booked}
            userName={userName}
            currentUser={currentUser}
            isSelected={selectedDesk === desk.id}
            onSelect={setSelectedDesk}
            onBook={handleBooking}
            onDelete={handleDelete}
          />
        );
      })}
    </div>
  );
}

export default DeskMap;
