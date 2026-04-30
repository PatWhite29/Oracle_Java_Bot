import React, { useState, useEffect, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { taskService } from '../services/taskService';
import { sprintService } from '../services/sprintService';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskTable from '../components/tasks/TaskTable';
import TaskDetail from '../components/tasks/TaskDetail';
import TaskForm from '../components/tasks/TaskForm';
import ImportTasksModal from '../components/tasks/ImportTasksModal';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function TasksPage() {
  const { project, members, userRole } = useProject();
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('kanban');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ status: '', sprint: '', priority: '' });
  const [showClosed, setShowClosed] = useState(false);
  const [donePrompt, setDonePrompt] = useState(null);
  const [actualHoursInput, setActualHoursInput] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const isManager = userRole === 'MANAGER';

  const load = useCallback(() => {
    setLoading(true);
    taskService.list(project.id, filters)
      .then((data) => setTasks(data.content || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [project.id, filters]);

  useEffect(load, [load]);

  useEffect(() => {
    sprintService.list(project.id).then((data) => {
      setSprints(data);
      const active = data.find((s) => s.status === 'ACTIVE');
      const fallback = data
        .filter((s) => s.status === 'PLANNING')
        .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
      const defaultSprint = active || fallback;
      if (defaultSprint) setFilters((f) => ({ ...f, sprint: String(defaultSprint.id) }));
    }).catch(() => {});
  }, [project.id]);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await taskService.create(project.id, form);
      setShowForm(false);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (form) => {
    setSaving(true);
    try {
      await taskService.update(project.id, editTask.id, form);
      setEditTask(null);
      setSelectedTask(null);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (task, status) => {
    if (status === 'DONE') {
      setDonePrompt({ task, status });
      setActualHoursInput('');
      return;
    }
    try {
      const updated = await taskService.changeStatus(project.id, task.id, status);
      if (selectedTask?.id === updated.id) setSelectedTask(updated);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleDoneConfirm = async () => {
    const hours = parseFloat(actualHoursInput);
    if (!actualHoursInput || isNaN(hours) || hours <= 0) {
      toast.warning('Please enter a valid number of hours greater than 0.');
      return;
    }
    const { task } = donePrompt;
    setDonePrompt(null);
    try {
      const updated = await taskService.changeStatus(project.id, task.id, 'DONE', hours);
      if (selectedTask?.id === updated.id) setSelectedTask(updated);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = (task) => {
    setConfirmDelete(task);
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await taskService.delete(project.id, confirmDelete.id);
      setConfirmDelete(null);
      setSelectedTask(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const allMembers = project.manager
    ? [project.manager, ...members.filter((m) => m.id !== project.manager.id)]
    : members;

  const visibleSprints = showClosed ? sprints : sprints.filter((s) => s.status !== 'CLOSED');

  const handleShowClosedToggle = (e) => {
    const checked = e.target.checked;
    setShowClosed(checked);
    if (!checked) {
      const selectedSprintClosed = sprints.find((s) => String(s.id) === filters.sprint)?.status === 'CLOSED';
      if (selectedSprintClosed) setFilters((f) => ({ ...f, sprint: '' }));
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold text-gray-900">Tasks — {project.projectName}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setView('kanban')}
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${view === 'kanban' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >Kanban</button>
          <button
            onClick={() => setView('list')}
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${view === 'list' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >List</button>
          {isManager ? (
            <>
              <Button variant="secondary" onClick={() => setShowImport(true)}>Importar tareas</Button>
              <Button onClick={() => setShowForm(true)}>New task</Button>
            </>
          ) : (
            <span className="text-xs text-gray-400 italic">Only managers can create tasks</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
          <option value="">All statuses</option>
          {['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={filters.sprint} onChange={(e) => setFilters((f) => ({ ...f, sprint: e.target.value }))}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none min-w-0 flex-1 sm:flex-none sm:max-w-[180px]">
          <option value="">All sprints</option>
          {visibleSprints.map((s) => (
            <option key={s.id} value={s.id}>
              {s.sprintName}{s.status === 'CLOSED' ? ' (closed)' : ''}
            </option>
          ))}
        </select>
        <select value={filters.priority} onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
          <option value="">All priorities</option>
          {['LOW', 'MEDIUM', 'HIGH'].map((p) => <option key={p}>{p}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none ml-1">
          <input
            type="checkbox"
            checked={showClosed}
            onChange={handleShowClosedToggle}
            className="w-4 h-4 rounded border-gray-300 accent-gray-800 cursor-pointer"
          />
          Show closed sprints
        </label>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {loading ? <LoadingSpinner /> : (
        view === 'kanban'
          ? <KanbanBoard tasks={tasks} onTaskClick={setSelectedTask} onStatusChange={handleStatusChange} />
          : <TaskTable tasks={tasks} onTaskClick={setSelectedTask} />
      )}

      <Modal open={!!selectedTask} onClose={() => setSelectedTask(null)} title="Task detail" size="lg">
        {selectedTask && (
          <TaskDetail
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onStatusChange={handleStatusChange}
            onEdit={(t) => { setEditTask(t); setSelectedTask(null); }}
            onDelete={handleDelete}
          />
        )}
      </Modal>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New task">
        <TaskForm sprints={visibleSprints} members={allMembers} onSubmit={handleCreate} onCancel={() => setShowForm(false)} loading={saving} />
      </Modal>

      <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit task">
        {editTask && (
          <TaskForm initial={editTask} sprints={visibleSprints} members={allMembers} onSubmit={handleUpdate} onCancel={() => setEditTask(null)} loading={saving} />
        )}
      </Modal>

      <Modal open={!!donePrompt} onClose={() => setDonePrompt(null)} title="Mark as DONE">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Enter the actual hours spent on <span className="font-medium">{donePrompt?.task?.taskName}</span>.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actual hours <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0.1"
              step="0.5"
              value={actualHoursInput}
              onChange={(e) => setActualHoursInput(e.target.value)}
              placeholder="e.g. 3.5"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleDoneConfirm(); }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDonePrompt(null)}>Cancel</Button>
            <Button onClick={handleDoneConfirm}>Confirm DONE</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={doDelete}
        title="Delete task"
        message={`"${confirmDelete?.taskName}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />

      <ImportTasksModal
        open={showImport}
        onClose={() => setShowImport(false)}
        projectId={project.id}
        onImported={() => { load(); toast.success('Tareas importadas al backlog.'); }}
      />
    </div>
  );
}
