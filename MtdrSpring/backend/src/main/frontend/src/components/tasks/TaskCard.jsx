import React, { useState } from 'react';
import Badge from '../common/Badge';

export default function TaskCard({ task, onClick, onDragStart, onDragEnd, dragging }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(task)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`bg-white rounded-xl p-3.5 cursor-grab active:cursor-grabbing flex flex-col gap-2.5 transition-all duration-150 ${dragging ? 'opacity-40 scale-95' : ''}`}
      style={{
        border: `1px solid ${hovered ? '#D1D5DB' : '#E5E7EB'}`,
        boxShadow: hovered ? '0 4px 14px rgba(0,0,0,0.09)' : '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <p className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2">{task.taskName}</p>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {task.priority && <Badge value={task.priority} />}
        </div>
        <span className="text-[11px] text-gray-400 font-mono shrink-0">{task.storyPoints} SP</span>
      </div>

      {task.assignedTo && (
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
            <span className="text-[9px] font-bold text-gray-600">
              {task.assignedTo.fullName?.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </span>
          </div>
          <span className="text-[11px] text-gray-500 truncate">{task.assignedTo.fullName}</span>
        </div>
      )}
    </div>
  );
}
