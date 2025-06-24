function CalendarPicker({ selectedDate, onChange }) {
    return (
      <div style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        backgroundColor: 'white',
        padding: '0.5rem 1rem',
        border: '1px solid #ccc',
        borderRadius: '8px',
        zIndex: 10
      }}>
        <label style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>Date :</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }
  
  export default CalendarPicker;
  