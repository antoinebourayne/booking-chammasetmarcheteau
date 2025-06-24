import Desk from './Desk';

function DeskMap({ desks, layout, currentUser, selectedDesk, setSelectedDesk, handleBooking, handleDelete }) {
  return (
    <div style={{
      position: 'relative',
      width: 800,
      height: 600,
      margin: '2rem auto',
      overflow: 'hidden',
      backgroundColor: '#DAD0D0'
    }}>
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
