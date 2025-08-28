function FloorSwitch({ floors = [], currentFloor, onChange }) {
  const labels = {
    ballu5_rdj: "Ballu 5 – RDJ",
    ballu5_rdc: "Ballu 5 – RDC",
    ballu5_r2: "Ballu 5 – R2",
    ballu5_r3: "Ballu 5 – R3",
    ballu5_r4: "Ballu 5 – R4"
  };

  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem' }}>
      <strong>{labels[currentFloor] || currentFloor}</strong>
      <select
        value={currentFloor}
        onChange={(e) => onChange?.(e.target.value)}
        style={{ padding:'0.25rem 0.5rem' }}
        aria-label="Choisir l’étage"
      >
        {floors.map(f => (
          <option key={f} value={f}>{labels[f] || f}</option>
        ))}
      </select>
    </div>
  );
}
export default FloorSwitch;
