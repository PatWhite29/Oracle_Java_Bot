import React, { useEffect } from 'react';
import { NavLink, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';

function NavItem({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
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

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { project, userRole } = useProject();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`
      fixed inset-y-0 left-0 w-56 bg-white border-r border-gray-100 flex flex-col z-40
      transition-transform duration-300
      ${open ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0
    `}>
      <div className="px-4 py-5 border-b border-gray-100 flex items-center justify-between">
        <span className="font-bold text-gray-900">Chuva Bot</span>
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-400"
          aria-label="Close menu"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <NavItem to="/projects">My Projects</NavItem>
        <NavItem to="/profile">Profile</NavItem>

        {project && projectId && (
          <>
            <div className="pt-3 pb-1 px-3">
              <div className="flex items-center gap-1.5">
                {userRole === 'MANAGER' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 19h20v2H2v-2zM2 6l5 7 5-7 5 7 5-7v11H2V6z"/>
                  </svg>
                )}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
                  {project.projectName}
                </p>
              </div>
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
