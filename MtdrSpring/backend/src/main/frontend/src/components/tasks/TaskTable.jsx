import React from 'react';
import Badge from '../common/Badge';

export default function TaskTable({ tasks, onTaskClick }) {
  if (tasks.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">No tasks found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
            <th className="pb-3 pr-4">Name</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3 pr-4">Priority</th>
            <th className="pb-3 pr-4">SP</th>
            <th className="pb-3 pr-4">Assigned</th>
            <th className="pb-3">Sprint</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr
              key={t.id}
              onClick={() => onTaskClick(t)}
              className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="py-3 pr-4 font-medium text-gray-800">{t.taskName}</td>
              <td className="py-3 pr-4"><Badge value={t.status} /></td>
              <td className="py-3 pr-4">{t.priority ? <Badge value={t.priority} /> : <span className="text-gray-300">—</span>}</td>
              <td className="py-3 pr-4 text-gray-500">{t.storyPoints}</td>
              <td className="py-3 pr-4 text-gray-500">{t.assignedTo?.fullName || <span className="text-gray-300">—</span>}</td>
              <td className="py-3 text-gray-500">{t.sprint?.sprintName || <span className="text-gray-300">Backlog</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
