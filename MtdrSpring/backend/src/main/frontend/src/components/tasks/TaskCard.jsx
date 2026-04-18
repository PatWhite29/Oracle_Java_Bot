import React from 'react';
import Badge from '../common/Badge';

export default function TaskCard({ task, onClick, onDragStart, onDragEnd, dragging }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(task)}
      className={`bg-white border border-gray-100 rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all space-y-2 ${dragging ? 'opacity-40 scale-95' : 'opacity-100'}`}
    >
      <p className="text-sm font-medium text-gray-900 line-clamp-2">{task.taskName}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {task.priority && <Badge value={task.priority} />}
        </div>
        <span className="text-xs text-gray-400">{task.storyPoints} SP</span>
      </div>
      {task.assignedTo && (
        <p className="text-xs text-gray-500 truncate">{task.assignedTo.fullName}</p>
      )}
    </div>
  );
}
