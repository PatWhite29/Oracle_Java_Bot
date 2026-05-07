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
      className={`rounded-xl p-3.5 cursor-grab active:cursor-grabbing flex flex-col gap-2.5 transition-all duration-150 ${dragging ? 'opacity-40 scale-95' : ''}`}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? 'var(--border-strong)' : 'var(--border)'}`,
        boxShadow: hovered ? '0 4px 14px var(--shadow-drop)' : '0 1px 3px var(--shadow-card)',
      }}
    >
      <p className="text-[13px] font-semibold leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>{task.taskName}</p>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {task.priority && <Badge value={task.priority} />}
        </div>
        <span className="text-[11px] font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>{task.storyPoints} SP</span>
      </div>

      {task.assignedTo && (
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--bg-card-alt)' }}>
            <span className="text-[9px] font-bold" style={{ color: 'var(--text-secondary)' }}>
              {task.assignedTo.fullName?.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </span>
          </div>
          <span className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>{task.assignedTo.fullName}</span>
        </div>
      )}
    </div>
  );
}
