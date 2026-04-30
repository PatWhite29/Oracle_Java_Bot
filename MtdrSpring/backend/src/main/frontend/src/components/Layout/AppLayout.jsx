import React, { useState, useCallback } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const { token } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={closeSidebar}
        />
      )}
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 flex flex-col md:ml-56 min-w-0">
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-600"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-gray-900 text-sm">Chuva Bot</span>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
