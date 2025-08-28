import { useRef, useState, useCallback } from 'react';
import Desk from './Desk';

function DeskMap({
  desks,
  layout,
  floorImage,
  currentUser,
  selectedDesk,
  setSelectedDesk,
  handleBooking,
  handleDelete,
  isAdmin = false,
  onDeskPositionChange,
  onAdminDelete,
  onAdminAssign,
  onAdminRemoveDesk,
  onOpenReserveDays,
  children
}) {
  const containerRef = useRef(null);
  const [dragState, setDragState] = useState(null);

  const pctToNum = (s) => {
    if (typeof s === 'string' && s.endsWith('%')) return parseFloat(s.slice(0, -1)) || 0;
    if (typeof s === 'number') return s;
    return 0;
  };
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  // Clique "fond de carte" => fermer la bulle
  const handleBackgroundClick = () => {
    if (selectedDesk != null) setSelectedDesk(null);
  };

  const onMouseDownDesk = useCallback((e, desk) => {
    if (!isAdmin) return;
    const container = containerRef.current;
    if (!container) return;

    // Ne pas propager pour éviter de déclencher handleBackgroundClick
    e.stopPropagation();

    const rect = container.getBoundingClientRect();
    const deskTop = pctToNum(desk.top) / 100 * rect.height;
    const deskLeft = pctToNum(desk.left) / 100 * rect.width;

    const startX = e.clientX;
    const startY = e.clientY;

    setDragState({
      deskId: desk.desk_id,
      startX,
      startY,
      startTopPx: deskTop,
      startLeftPx: deskLeft
    });
  }, [isAdmin]);

  const onMouseMove = useCallback((e) => {
    if (!dragState) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;

    let newTopPx = clamp(dragState.startTopPx + dy, 0, rect.height);
    let newLeftPx = clamp(dragState.startLeftPx + dx, 0, rect.width);

    const ghost = container.querySelector(`[data-desk-ghost="${dragState.deskId}"]`);
    if (ghost) {
      const topPct = (newTopPx / rect.height) * 100;
      const leftPct = (newLeftPx / rect.width) * 100;
      ghost.style.top = `${topPct}%`;
      ghost.style.left = `${leftPct}%`;
    }
  }, [dragState]);

  const onMouseUp = useCallback(async (e) => {
    if (!dragState) return;
    const container = containerRef.current;
    if (!container) { setDragState(null); return; }
    const rect = container.getBoundingClientRect();

    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;

    let newTopPx = clamp(dragState.startTopPx + dy, 0, rect.height);
    let newLeftPx = clamp(dragState.startLeftPx + dx, 0, rect.width);

    const topPct = +((newTopPx / rect.height) * 100).toFixed(2);
    const leftPct = +((newLeftPx / rect.width) * 100).toFixed(2);

    if (isAdmin && typeof onDeskPositionChange === 'function') {
      try {
        await onDeskPositionChange(dragState.deskId, topPct, leftPct);
      } catch {}
    }

    setDragState(null);
  }, [dragState, isAdmin, onDeskPositionChange]);

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onClick={handleBackgroundClick}  
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '1000px',
        height: '80vh',
        margin: '0 auto',
        paddingTop: '0.5rem',
        overflow: 'hidden',
        backgroundColor: '#DAD0D0',
        userSelect: isAdmin && dragState ? 'none' : 'auto',
        cursor: isAdmin ? (dragState ? 'grabbing' : 'grab') : 'default'
      }}
    >
      {children}
      <img
        src={floorImage}
        alt="plan étage"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none'
        }}
      />

      {desks.map((desk) => {
        const isSelected = selectedDesk === desk.desk_id;
        const userName = desk.user?.name;

        const wrapperStyle = {
          position: 'absolute',
          top: desk.top,
          left: desk.left,
          width: '6vw',
          height: '6vw',
          minWidth: '28px',
          minHeight: '28px',
          maxWidth: '50px',
          maxHeight: '50px',
          zIndex: (isSelected ? 9998 : (isAdmin && dragState?.deskId === desk.desk_id ? 20 : 5))
        };

        return (
          <div
            key={desk.desk_id}
            data-desk-ghost={desk.desk_id}
            style={wrapperStyle}
            onMouseDown={(e) => onMouseDownDesk(e, desk)}
            onClick={(e) => e.stopPropagation()}
          >
            <Desk
              desk={{ id: desk.desk_id, top: desk.top, left: desk.left }}
              booked={desk.booked}
              userName={userName}
              currentUser={currentUser}
              isSelected={isSelected}
              onSelect={setSelectedDesk}
              onBook={handleBooking}
              onDelete={handleDelete}
              isAdmin={isAdmin}
              onAdminDelete={onAdminDelete}
              onAdminAssign={onAdminAssign}
              onAdminRemoveDesk={onAdminRemoveDesk}
              onOpenReserveDays={onOpenReserveDays}
            />
          </div>
        );
      })}
    </div>
  );
}

export default DeskMap;
