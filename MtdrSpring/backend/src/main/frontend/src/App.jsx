import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { ToastProvider } from './context/ToastContext';

import AuthLayout from './components/Layout/AuthLayout';
import AppLayout from './components/Layout/AppLayout';
import ProjectLayout from './components/Layout/ProjectLayout';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyProjectsPage from './pages/MyProjectsPage';
import TasksPage from './pages/TasksPage';
import SprintsPage from './pages/SprintsPage';
import BacklogPage from './pages/BacklogPage';
import MembersPage from './pages/MembersPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ProjectProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              <Route element={<AppLayout />}>
                <Route path="/projects" element={<MyProjectsPage />} />
                <Route path="/profile" element={<ProfilePage />} />

                <Route path="/projects/:projectId" element={<ProjectLayout />}>
                  <Route index element={<Navigate to="tasks" replace />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="sprints" element={<SprintsPage />} />
                  <Route path="backlog" element={<BacklogPage />} />
                  <Route path="members" element={<MembersPage />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/projects" replace />} />
            </Routes>
          </BrowserRouter>
        </ProjectProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
