import React, { useRef, useState } from 'react';
import SprintCard from './SprintCard';

export default function SprintList({ sprints, isManager, onActivate, onClose, onReopen, onSelect }) {
  const ref = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e) => {
    setDragging(true);
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
    ref.current.style.cursor = 'grabbing';
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    ref.current.scrollLeft = scrollLeft - (x - startX);
  };

  const stopDrag = () => {
    setDragging(false);
    if (ref.current) ref.current.style.cursor = 'grab';
  };

  if (sprints.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">No sprints yet.</p>;
  }

  return (
    <div className="w-full overflow-hidden">
      <div
        ref={ref}
        className="flex flex-col sm:flex-row gap-4 sm:overflow-x-auto pb-2 select-none"
        style={{ cursor: 'grab', scrollbarWidth: 'thin' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        {sprints.map((s) => (
          <div key={s.id} className="w-full sm:w-72 sm:shrink-0">
            <SprintCard sprint={s} isManager={isManager} onActivate={onActivate} onClose={onClose} onReopen={onReopen} onSelect={onSelect} />
          </div>
        ))}
      </div>
    </div>
  );
}
