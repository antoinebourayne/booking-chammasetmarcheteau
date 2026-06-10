function FloorSwitch({ floors = [], currentFloor, onChange }) {
  const labels = {
    ballu5_rdj: 'RDJ',
    ballu5_rdc: 'RDC',
    ballu5_r2: 'R+2',
    ballu5_r3: 'R+3',
    ballu5_r4: 'R+4',
  };

  return (
    <div style={{
      display: 'flex',
      gap: '2px',
      background: 'var(--bg-card)',
      borderRadius: '8px',
      padding: '3px',
      border: '1px solid var(--border)',
    }}>
      {floors.map(f => {
        const active = currentFloor === f;
        return (
          <button
            key={f}
            onClick={() => onChange?.(f)}
            style={{
              padding: '0.28rem 0.7rem',
              borderRadius: '5px',
              border: 'none',
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? '#ffffff' : 'var(--text-2)',
              fontWeight: active ? '700' : '400',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            {labels[f] || f}
          </button>
        );
      })}
    </div>
  );
}

export default FloorSwitch;
