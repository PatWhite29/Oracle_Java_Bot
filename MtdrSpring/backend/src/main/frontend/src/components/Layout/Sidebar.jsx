import React from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive ? 'bg-gray-900 text-white font-medium' : 'text-gray-600 hover:bg-gray-100'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { project } = useProject();
  const { projectId } = useParams();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-56 bg-white border-r border-gray-100 flex flex-col z-40">
      <div className="px-4 py-5 border-b border-gray-100">
        <span className="font-bold text-gray-900">Chuva Bot</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <NavItem to="/projects">My Projects</NavItem>
        <NavItem to="/profile">Profile</NavItem>

        {project && projectId && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
                {project.projectName}
              </p>
            </div>
            <NavItem to={`/projects/${projectId}/tasks`}>Tasks</NavItem>
            <NavItem to={`/projects/${projectId}/sprints`}>Sprints</NavItem>
            <NavItem to={`/projects/${projectId}/backlog`}>Backlog</NavItem>
            <NavItem to={`/projects/${projectId}/members`}>Members</NavItem>
            <NavItem to={`/projects/${projectId}/dashboard`}>Dashboard</NavItem>
          </>
        )}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <p className="text-sm font-medium text-gray-800 truncate">{user?.fullName}</p>
        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="mt-3 text-xs text-gray-500 hover:text-gray-800 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
