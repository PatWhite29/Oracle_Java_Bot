import React, { useEffect } from 'react';
import { NavLink, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { useTheme } from '../../context/ThemeContext';
import KairoMark from '../common/KairoMark';

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0zM7.05 18.36l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0z"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
  </svg>
);

const Icons = {
  grid: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
    </svg>
  ),
  user: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  ),
  tasks: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3l1.41 1.41L9 11.83l-2.41-2.42L8 8l1 1 3-3zm7 10H5v-2h14v2zm0-4H5v-2h14v2z" />
    </svg>
  ),
  sprint: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
    </svg>
  ),
  backlog: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
    </svg>
  ),
  members: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  ),
  dashboard: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
    </svg>
  ),
  logout: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
    </svg>
  ),
  star: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  ),
};

function NavItem({ to, icon, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${
          isActive
            ? 'bg-white/12 text-white font-semibold'
            : 'text-white/60 hover:bg-white/5 hover:text-white/85'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-oracle rounded-r-full" />
          )}
          <span className={isActive ? 'opacity-100' : 'opacity-55'}>{icon}</span>
          {children}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { project, userRole } = useProject();
  const { dark, toggle } = useTheme();
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

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')
    : '?';

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 w-56 flex flex-col z-40
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}
      style={{ background: '#6D28D9' }}
    >
      {/* Header */}
      <div
        className="px-4 py-5 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2.5">
          <KairoMark size={36} />
          <div>
            <div
              className="font-display text-base font-extrabold text-white leading-none"
              style={{ letterSpacing: '-0.03em' }}
            >
              Kairo
            </div>
            <div className="text-[9px] font-bold tracking-[0.10em] uppercase mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              CD Deploy Test
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded-lg text-white/40 hover:text-white transition-colors"
          aria-label="Close menu"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-0.5">
        <div className="px-3 pb-2 pt-1 text-[10px] font-bold tracking-[0.08em] uppercase" style={{ color: 'rgba(255,255,255,0.28)' }}>
          General
        </div>
        <NavItem to="/projects" icon={Icons.grid}>My Projects</NavItem>
        <NavItem to="/profile" icon={Icons.user}>Profile</NavItem>

        {project && projectId && (
          <>
            <div className="my-2.5 mx-2" style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <div className="px-3 pb-2 flex items-center gap-1.5">
              <span className="text-[10px] font-bold tracking-[0.08em] uppercase truncate" style={{ color: 'rgba(255,255,255,0.28)' }}>
                {project.projectName}
              </span>
              {userRole === 'MANAGER' && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold rounded px-1.5 py-0.5"
                  style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.50)' }}>
                  {Icons.star} MGR
                </span>
              )}
            </div>
            <NavItem to={`/projects/${projectId}/tasks`} icon={Icons.tasks}>Tasks</NavItem>
            <NavItem to={`/projects/${projectId}/sprints`} icon={Icons.sprint}>Sprints</NavItem>
            <NavItem to={`/projects/${projectId}/backlog`} icon={Icons.backlog}>Backlog</NavItem>
            <NavItem to={`/projects/${projectId}/members`} icon={Icons.members}>Members</NavItem>
            <NavItem to={`/projects/${projectId}/dashboard`} icon={Icons.dashboard}>Dashboard</NavItem>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: '#C74634' }}
          >
            <span className="font-display text-[13px] font-bold text-white">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">{user?.fullName}</p>
            <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.40)' }}>{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          >
            <span style={{ opacity: 0.7 }}>{Icons.logout}</span>
            Sign out
          </button>
          <button
            type="button"
            onClick={toggle}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.40)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.40)')}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </aside>
  );
}
