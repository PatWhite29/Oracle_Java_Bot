import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { projectService } from '../services/projectService';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectForm from '../components/projects/ProjectForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';

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

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">My Projects</h1>
        <Button onClick={() => setShowCreate(true)}>New project</Button>
      </div>

      {loading && <LoadingSpinner />}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && projects.length === 0 && (
        <p className="text-sm text-gray-400 py-8 text-center">No projects yet. Create one to get started.</p>
      )}
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New project">
        <ProjectForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} loading={saving} />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Editar proyecto">
        <ProjectForm
          initial={editTarget || {}}
          onSubmit={handleEditProject}
          onCancel={() => setEditTarget(null)}
          loading={editSaving}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar proyecto"
        message={`¿Eliminar "${deleteTarget?.projectName}" y todo su contenido? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteProject}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
