import React, { useState, useRef } from 'react';
import KanbanColumn from './KanbanColumn';
import { useIsMobile } from '../../hooks/useIsMobile';

const STATUSES = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'];

const LABELS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  BLOCKED: 'Blocked',
  DONE: 'Done',
};

export default function KanbanBoard({ tasks, onTaskClick, onStatusChange }) {
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [activeColumn, setActiveColumn] = useState('TODO');
  const suppressNextClick = useRef(false);
  const isMobile = useIsMobile(768);

  const byStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s);
    return acc;
  }, {});

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingTaskId(task.id);
    suppressNextClick.current = false;
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    suppressNextClick.current = true;
  };

  const handleDrop = (taskId, newStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    setDraggingTaskId(null);
    if (!task || task.status === newStatus) return;
    suppressNextClick.current = true;
    onStatusChange(task, newStatus);
  };

  const handleClickCapture = (e) => {
    if (suppressNextClick.current) {
      e.stopPropagation();
      suppressNextClick.current = false;
    }
  };

  if (isMobile) {
    return (
      <div>
        <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setActiveColumn(s)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                activeColumn === s
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {LABELS[s]}
              <span className="ml-1.5 text-xs text-gray-400">{byStatus[s].length}</span>
            </button>
          ))}
        </div>
        <KanbanColumn
          key={activeColumn}
          status={activeColumn}
          tasks={byStatus[activeColumn]}
          onTaskClick={onTaskClick}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          draggingTaskId={draggingTaskId}
          mobileMode
        />
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" onClickCapture={handleClickCapture}>
      {STATUSES.map((s) => (
        <KanbanColumn
          key={s}
          status={s}
          tasks={byStatus[s]}
          onTaskClick={onTaskClick}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          draggingTaskId={draggingTaskId}
        />
      ))}
    </div>
  );
}
