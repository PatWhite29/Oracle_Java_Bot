import React from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../common/Badge';

export default function ProjectCard({ project, currentUserId }) {
  const navigate = useNavigate();
  const isManager = project.manager?.id === currentUserId;

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}/tasks`)}
      className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 text-sm">{project.projectName}</h3>
        <Badge value={project.status} />
      </div>
      {project.description && (
        <p className="text-xs text-gray-500 line-clamp-2">{project.description}</p>
      )}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className={`font-medium ${isManager ? 'text-gray-700' : 'text-gray-400'}`}>
          {isManager ? 'Manager' : 'Member'}
        </span>
        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
