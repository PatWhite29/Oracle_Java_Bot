import React, { useState } from 'react';
import TaskCard from './TaskCard';

const COLORS = {
  TODO: 'border-gray-300',
  IN_PROGRESS: 'border-blue-400',
  BLOCKED: 'border-red-400',
  DONE: 'border-green-400',
};

const HOVER_BG = {
  TODO: 'bg-gray-100',
  IN_PROGRESS: 'bg-blue-50',
  BLOCKED: 'bg-red-50',
  DONE: 'bg-green-50',
};

export default function KanbanColumn({ status, tasks, onTaskClick, onDragStart, onDragEnd, onDrop, draggingTaskId }) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = Number(e.dataTransfer.getData('taskId'));
    if (taskId) onDrop(taskId, status);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col min-w-[220px] w-full rounded-xl border-t-4 ${COLORS[status]} p-3 gap-2 transition-colors ${isOver ? HOVER_BG[status] : 'bg-gray-50'}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{status.replace('_', ' ')}</span>
        <span className="text-xs text-gray-400">{tasks.length}</span>
      </div>
      {tasks.length === 0 && (
        <div className={`text-xs text-gray-400 text-center py-6 rounded-lg border-2 border-dashed transition-colors ${isOver ? 'border-gray-400 text-gray-500' : 'border-transparent'}`}>
          {isOver ? 'Drop here' : 'No tasks'}
        </div>
      )}
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
