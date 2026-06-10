import { useRef, useState, useCallback } from 'react';
import Desk from './Desk';

function DeskMap({
  desks,
  layout,
  floorImage,
  svgRatio,
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

  const handleBackgroundClick = () => {
    if (selectedDesk != null) setSelectedDesk(null);
  };

  const onMouseDownDesk = useCallback((e, desk) => {
    if (!isAdmin) return;
    const container = containerRef.current;
    if (!container) return;

    e.stopPropagation();

    const rect = container.getBoundingClientRect();
    const deskTop = pctToNum(desk.top) / 100 * rect.height;
    const deskLeft = pctToNum(desk.left) / 100 * rect.width;

    setDragState({
      deskId: desk.desk_id,
      startX: e.clientX,
      startY: e.clientY,
      startTopPx: deskTop,
      startLeftPx: deskLeft,
    });
  }, [isAdmin]);

  const onMouseMove = useCallback((e) => {
    if (!dragState) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;

    const newTopPx = clamp(dragState.startTopPx + dy, 0, rect.height);
    const newLeftPx = clamp(dragState.startLeftPx + dx, 0, rect.width);

    const ghost = container.querySelector(`[data-desk-ghost="${dragState.deskId}"]`);
    if (ghost) {
      ghost.style.top = `${(newTopPx / rect.height) * 100}%`;
      ghost.style.left = `${(newLeftPx / rect.width) * 100}%`;
    }
  }, [dragState]);

  const onMouseUp = useCallback(async (e) => {
    if (!dragState) return;
    const container = containerRef.current;
    if (!container) { setDragState(null); return; }
    const rect = container.getBoundingClientRect();

    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;

    const topPct = +((clamp(dragState.startTopPx + dy, 0, rect.height) / rect.height) * 100).toFixed(2);
    const leftPct = +((clamp(dragState.startLeftPx + dx, 0, rect.width) / rect.width) * 100).toFixed(2);

    if (isAdmin && typeof onDeskPositionChange === 'function') {
      try { await onDeskPositionChange(dragState.deskId, topPct, leftPct); } catch {}
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
        width: `min(100%, 960px, calc(82vh * ${svgRatio || 798 / 752}))`,
        aspectRatio: svgRatio != null ? String(svgRatio) : '798 / 752',
        margin: '0 auto',
        overflow: 'hidden',
        backgroundColor: 'transparent',
        borderRadius: '12px',
        boxShadow: '0 0 0 1px rgba(201,168,76,0.18), 0 24px 60px rgba(0,0,0,0.7)',
        userSelect: isAdmin && dragState ? 'none' : 'auto',
        cursor: isAdmin ? (dragState ? 'grabbing' : 'grab') : 'default',
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
          objectFit: 'fill',
          pointerEvents: 'none',
          opacity: 1,
        }}
      />

      {desks.map((desk) => {
        const isSelected = selectedDesk === desk.desk_id;
        const userName = desk.user?.name;

        return (
          <div
            key={desk.desk_id}
            data-desk-ghost={desk.desk_id}
            style={{
              position: 'absolute',
              top: desk.top,
              left: desk.left,
              width: 'clamp(20px, 5vh, 52px)',
              aspectRatio: '1 / 1',
              zIndex: isSelected ? 9998 : (isAdmin && dragState?.deskId === desk.desk_id ? 20 : 5),
            }}
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
