import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../common/Badge';

const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 3h6l1 1h4v2H4V4h4L9 3zm-4 5h14l-1 13H6L5 8zm5 2v9h1v-9h-1zm4 0v9h1v-9h-1z"/>
  </svg>
);

export default function ProjectCard({ project, currentUserId, onDelete, onEdit }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const isManager = project.manager?.id === currentUserId;

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}/tasks`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-2xl cursor-pointer flex flex-col gap-3.5 p-6 transition-all duration-200"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? 'var(--border-strong)' : 'var(--border)'}`,
        boxShadow: hovered ? '0 8px 24px var(--shadow-drop)' : '0 1px 4px var(--shadow-card)',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display font-bold text-[15px] leading-snug" style={{ letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
          {project.projectName}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge value={project.status} />
          {isManager && onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(project); }}
              className="p-1 rounded text-gray-300 hover:text-navy transition-colors"
              title="Edit project"
            >
              <EditIcon />
            </button>
          )}
          {isManager && onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(project); }}
              className="p-1 rounded text-gray-300 hover:text-oracle transition-colors"
              title="Delete project"
            >
              <TrashIcon />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-[13px] leading-relaxed line-clamp-2 flex-1" style={{ color: 'var(--text-secondary)' }}>
          {project.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className={`flex items-center gap-1 text-[11px] font-semibold ${isManager ? 'text-amber-600' : 'text-gray-400'}`}>
          {isManager && <StarIcon />}
          {isManager ? 'Manager' : 'Member'}
        </span>
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
}
