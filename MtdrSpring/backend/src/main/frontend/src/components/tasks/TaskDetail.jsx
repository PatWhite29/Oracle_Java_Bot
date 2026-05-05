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
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    taskService.getActivities(project.id, task.id)
      .then(setActivities)
      .catch(() => {});
  }, [project.id, task.id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    setCommentError('');
    try {
      await taskService.addComment(project.id, task.id, comment);
      setComment('');
      const updated = await taskService.getActivities(project.id, task.id);
      setActivities(updated);
    } catch (err) {
      setCommentError(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const isManager = userRole === 'MANAGER';
  const isAssigned = task.assignedTo?.id === user?.id;
  const canChangeStatus = isManager || isAssigned;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{task.taskName}</h3>
          {task.description && <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{task.description}</p>}
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
        <span style={{ color: 'var(--text-secondary)' }}>{task.storyPoints} SP</span>
        {task.actualHours != null && (
          <span style={{ color: 'var(--text-secondary)' }}>{task.actualHours}h actual</span>
        )}
        {task.assignedTo && <span style={{ color: 'var(--text-secondary)' }}>→ {task.assignedTo.fullName}</span>}
        {task.sprint && <span style={{ color: 'var(--text-secondary)' }}>{task.sprint.sprintName}</span>}
      </div>

      {canChangeStatus && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm w-full sm:w-auto" style={{ color: 'var(--text-secondary)' }}>Change status:</span>
          {['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'].map((s) => (
            <button
              key={s}
              disabled={task.status === s}
              onClick={() => onStatusChange(task, s)}
              className="text-xs px-2 py-1 rounded transition-colors"
              style={{
                border: '1px solid var(--border)',
                background: task.status === s ? 'var(--bg-card-alt)' : 'transparent',
                color: task.status === s ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: task.status === s ? 'default' : 'pointer',
              }}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Activity</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {activities.length === 0 && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No activity yet.</p>}
          {activities.map((a) => (
            <div key={a.id} className="text-xs rounded-lg px-3 py-2" style={{ color: 'var(--text-secondary)', background: 'var(--bg-card-alt)' }}>
              <span className="font-medium">{a.employee?.fullName}</span>
              {' '}
              <span style={{ color: 'var(--text-muted)' }}>[{a.activityType.replace('_', ' ')}]</span>
              {a.content && <span> — {a.content}</span>}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleComment} className="space-y-1">
        <div className="flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-mid/20 transition-all"
            style={{ border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
          />
          <Button type="submit" disabled={submitting || !comment.trim()}>Post</Button>
        </div>
        {commentError && <p className="text-xs text-red-600">{commentError}</p>}
      </form>
    </div>
  );
}
