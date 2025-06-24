function FloorSwitch({ currentFloor, onSwitch }) {
  return (
    <div style={{
      position: 'absolute',
      top: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.3rem',
      zIndex: 2,
      marginTop: '-2rem'
    }}>
      <button onClick={onSwitch} style={btnStyle}>↑</button>
      <div style={{
        backgroundColor: 'white',
        padding: '0.4rem 0.8rem',
        borderRadius: '4px',
        fontWeight: 'bold',
        border: '1px solid #ccc'
      }}>
        {currentFloor}
      </div>
      <button onClick={onSwitch} style={btnStyle}>↓</button>
    </div>
  );
}

const btnStyle = {
  backgroundColor: '#eee',
  border: '1px solid #aaa',
  borderRadius: '4px',
  padding: '0.3rem 0.6rem',
  cursor: 'pointer'
};

export default FloorSwitch;
