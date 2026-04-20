import React, { useState, useRef } from 'react';
import KanbanColumn from './KanbanColumn';

const STATUSES = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'];

export default function KanbanBoard({ tasks, onTaskClick, onStatusChange }) {
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const suppressNextClick = useRef(false);

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
