import React, { useState } from 'react';
import TaskCard from './TaskCard';

const COL_CONFIG = {
  TODO:        { label: 'To Do',       dot: 'var(--status-todo-dot)',     bg: 'var(--status-todo-bg)',     dropBg: 'var(--bg-card-alt)' },
  IN_PROGRESS: { label: 'In Progress', dot: 'var(--status-ip-dot)',       bg: 'var(--status-ip-bg)',       dropBg: 'var(--bg-card-alt)' },
  BLOCKED:     { label: 'Blocked',     dot: 'var(--status-blocked-dot)',  bg: 'var(--status-blocked-bg)',  dropBg: 'var(--bg-card-alt)' },
  DONE:        { label: 'Done',        dot: 'var(--status-done-dot)',     bg: 'var(--status-done-bg)',     dropBg: 'var(--bg-card-alt)' },
};

export default function KanbanColumn({ status, tasks, onTaskClick, onDragStart, onDragEnd, onDrop, draggingTaskId, mobileMode = false }) {
  const [isOver, setIsOver] = useState(false);
  const cfg = COL_CONFIG[status] ?? COL_CONFIG.TODO;

  const handleDragOver = (e) => { e.preventDefault(); setIsOver(true); };
  const handleDragLeave = (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsOver(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = Number(e.dataTransfer.getData('taskId'));
    if (taskId) onDrop(taskId, status);
  };

  return (
    <div
      onDragOver={!mobileMode ? handleDragOver : undefined}
      onDragLeave={!mobileMode ? handleDragLeave : undefined}
      onDrop={!mobileMode ? handleDrop : undefined}
      className={`flex flex-col ${mobileMode ? 'w-full' : 'min-w-[220px] w-full'} rounded-xl p-2 gap-2 transition-colors`}
      style={{ background: isOver ? cfg.dropBg : cfg.bg, border: '1px solid var(--border)' }}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-1 mb-1">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.dot }} />
        <span className="text-[12px] font-bold flex-1" style={{ color: cfg.dot, letterSpacing: '0.01em' }}>
          {cfg.label}
        </span>
        <span className="text-[11px] font-semibold rounded-full px-2 py-0.5" style={{ background: 'var(--bg-card-alt)', color: 'var(--text-secondary)' }}>
          {tasks.length}
        </span>
      </div>

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className={`text-xs text-gray-400 text-center py-8 rounded-lg border-2 border-dashed transition-colors ${isOver ? 'border-gray-400 text-gray-500' : 'border-transparent'}`}>
          {isOver ? 'Drop here' : 'No tasks'}
        </div>
      )}

      {/* Tasks */}
      {tasks.map((t) => (
        <TaskCard
          key={t.id}
          task={t}
          onClick={onTaskClick}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          dragging={draggingTaskId === t.id}
        />
      ))}
    </div>
  );
}
