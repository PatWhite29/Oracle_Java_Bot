import React, { useState, useEffect } from 'react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { taskService } from '../../services/taskService';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';

export default function TaskDetail({ task, onClose, onStatusChange, onEdit, onDelete }) {
  const { project, userRole } = useProject();
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    taskService.getActivities(project.id, task.id)
      .then(setActivities)
      .catch(() => {});
  }, [project.id, task.id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await taskService.addComment(project.id, task.id, comment);
      setComment('');
      const updated = await taskService.getActivities(project.id, task.id);
      setActivities(updated);
    } finally {
      setSubmitting(false);
    }
  };

  const isManager = userRole === 'MANAGER';
  const isAssigned = task.assignedTo?.id === user?.id;
  const canChangeStatus = isManager || isAssigned;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{task.taskName}</h3>
          {task.description && <p className="mt-1 text-sm text-gray-500">{task.description}</p>}
        </div>
        {isManager && (
          <div className="flex gap-2 shrink-0">
            <Button variant="secondary" onClick={() => onEdit(task)}>Edit</Button>
            <Button variant="danger" onClick={() => onDelete(task)}>Delete</Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Badge value={task.status} />
        {task.priority && <Badge value={task.priority} />}
        <span className="text-gray-500">{task.storyPoints} SP</span>
        {task.assignedTo && <span className="text-gray-500">→ {task.assignedTo.fullName}</span>}
        {task.sprint && <span className="text-gray-500">{task.sprint.sprintName}</span>}
      </div>

      {canChangeStatus && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Change status:</span>
          {['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'].map((s) => (
            <button
              key={s}
              disabled={task.status === s}
              onClick={() => onStatusChange(task, s)}
              className={`text-xs px-2 py-1 rounded border transition-colors ${task.status === s ? 'bg-gray-100 text-gray-400 cursor-default' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Activity</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {activities.length === 0 && <p className="text-xs text-gray-400">No activity yet.</p>}
          {activities.map((a) => (
            <div key={a.id} className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
              <span className="font-medium">{a.employee?.fullName}</span>
              {' '}
              <span className="text-gray-400">[{a.activityType.replace('_', ' ')}]</span>
              {a.content && <span> — {a.content}</span>}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleComment} className="flex gap-2">
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <Button type="submit" disabled={submitting || !comment.trim()}>Post</Button>
      </form>
    </div>
  );
}
