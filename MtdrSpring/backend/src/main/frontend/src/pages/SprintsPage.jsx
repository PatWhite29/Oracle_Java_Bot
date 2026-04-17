import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { sprintService } from '../services/sprintService';
import SprintList from '../components/sprints/SprintList';
import SprintForm from '../components/sprints/SprintForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function SprintsPage() {
  const { project, userRole } = useProject();
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  const isManager = userRole === 'MANAGER';

  const load = () => {
    setLoading(true);
    sprintService.list(project.id)
      .then(setSprints)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [project.id]);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await sprintService.create(project.id, form);
      setShowCreate(false);
      load();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleActivate = async (sprint) => {
    try {
      await sprintService.activate(project.id, sprint.id);
      load();
    } catch (err) { alert(err.message); }
  };

  const handleClose = async (sprint) => {
    if (!window.confirm(`Close sprint "${sprint.sprintName}"? This cannot be undone.`)) return;
    try {
      await sprintService.close(project.id, sprint.id);
      load();
    } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Sprints — {project.projectName}</h1>
        {isManager && <Button onClick={() => setShowCreate(true)}>New sprint</Button>}
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {loading ? <LoadingSpinner /> : (
        <SprintList sprints={sprints} isManager={isManager} onActivate={handleActivate} onClose={handleClose} />
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New sprint">
        <SprintForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} loading={saving} />
      </Modal>
    </div>
  );
}
