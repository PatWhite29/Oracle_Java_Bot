import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { projectService } from '../services/projectService';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectForm from '../components/projects/ProjectForm';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

export default function MyProjectsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const load = () => {
    setLoading(true);
    projectService.list()
      .then((data) => setProjects(data.content || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await projectService.create(form);
      setShowCreate(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditProject = async (form) => {
    if (!editTarget) return;
    setEditSaving(true);
    try {
      const updated = await projectService.update(editTarget.id, form);
      setProjects((prev) => prev.map((p) => (p.id === editTarget.id ? updated : p)));
      setEditTarget(null);
      toast.success('Proyecto actualizado');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await projectService.delete(deleteTarget.id);
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success('Proyecto eliminado');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const activeCount = projects.filter((p) => p.status === 'ACTIVE').length;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-7 gap-3">
        <div>
          <h1 className="font-display font-extrabold text-gray-900 text-[26px] leading-none" style={{ letterSpacing: '-0.02em' }}>
            My Projects
          </h1>
          <p className="text-[13px] text-gray-500 mt-1.5">
            {loading ? '…' : `${projects.length} workspace${projects.length !== 1 ? 's' : ''}${activeCount ? ` · ${activeCount} active` : ''}`}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white
            bg-navy hover:bg-navy-deep transition-colors shrink-0"
          style={{ letterSpacing: '0.01em' }}
        >
          <PlusIcon /> New project
        </button>
      </div>

      {/* States */}
      {loading && <LoadingSpinner />}
      {error && <p className="text-sm text-oracle bg-oracle-light rounded-lg px-3 py-2">{error}</p>}
      {!loading && projects.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No projects yet.</p>
          <p className="text-xs mt-1">Create one to get started.</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            currentUserId={user?.id}
            onEdit={setEditTarget}
            onDelete={setDeleteTarget}
          />
        ))}
      </div>

      {/* Modals */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New project">
        <ProjectForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} loading={saving} />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit project">
        <ProjectForm
          initial={editTarget || {}}
          onSubmit={handleEditProject}
          onCancel={() => setEditTarget(null)}
          loading={editSaving}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete project"
        message={`Delete "${deleteTarget?.projectName}" and all its content? This action cannot be undone.`}
        onConfirm={handleDeleteProject}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
