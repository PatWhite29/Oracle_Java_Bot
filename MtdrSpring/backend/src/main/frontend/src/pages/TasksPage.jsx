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
import FilterSelect from '../components/common/FilterSelect';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

const STATUS_OPTIONS = [
  { value: 'TODO',        label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'BLOCKED',     label: 'Blocked' },
  { value: 'DONE',        label: 'Done' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW',    label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH',   label: 'High' },
];

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
  const [filters, setFilters] = useState({ status: '', sprint: undefined, priority: '' });
  const [showClosed, setShowClosed] = useState(false);
  const [donePrompt, setDonePrompt] = useState(null);
  const [actualHoursInput, setActualHoursInput] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const isManager = userRole === 'MANAGER';

  const load = useCallback(() => {
    if (filters.sprint === undefined) return;
    setLoading(true);
    taskService.list(project.id, { ...filters, size: 500 })
      .then((data) => setTasks(data.content || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [project.id, filters]);

  useEffect(load, [load]);

  useEffect(() => {
    sprintService.list(project.id).then((data) => {
      setSprints(data);
      const active = data.find((s) => s.status === 'ACTIVE');
      const mostRecent = [...data].sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
      const defaultSprint = active || mostRecent;
      setFilters((f) => ({ ...f, sprint: defaultSprint ? String(defaultSprint.id) : '' }));
    }).catch(() => {
      setFilters((f) => ({ ...f, sprint: '' }));
    });
  }, [project.id]);

  const handleCreate = async (form) => {
    setSaving(true);
    try { await taskService.create(project.id, form); setShowForm(false); load(); }
    catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (form) => {
    setSaving(true);
    try { await taskService.update(project.id, editTask.id, form); setEditTask(null); setSelectedTask(null); load(); }
    catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (task, status) => {
    if (status === 'DONE') { setDonePrompt({ task, status }); setActualHoursInput(''); return; }
    try {
      const updated = await taskService.changeStatus(project.id, task.id, status);
      if (selectedTask?.id === updated.id) setSelectedTask(updated);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleDoneConfirm = async () => {
    const hours = parseFloat(actualHoursInput);
    if (!actualHoursInput || isNaN(hours) || hours <= 0) { toast.warning('Please enter a valid number of hours greater than 0.'); return; }
    const { task } = donePrompt;
    setDonePrompt(null);
    try {
      const updated = await taskService.changeStatus(project.id, task.id, 'DONE', hours);
      if (selectedTask?.id === updated.id) setSelectedTask(updated);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const doDelete = async () => {
    setDeleting(true);
    try { await taskService.delete(project.id, confirmDelete.id); setConfirmDelete(null); setSelectedTask(null); load(); }
    catch (err) { toast.error(err.message); }
    finally { setDeleting(false); }
  };

  const allMembers = project.manager
    ? [project.manager, ...members.filter((m) => m.id !== project.manager.id)]
    : members;

  const visibleSprints = showClosed ? sprints : sprints.filter((s) => s.status !== 'CLOSED');
  const activeSprint = sprints.find((s) => s.status === 'ACTIVE');
  const selectedSprint = sprints.find((s) => String(s.id) === filters.sprint);

  const handleShowClosedToggle = (e) => {
    const checked = e.target.checked;
    setShowClosed(checked);
    if (!checked) {
      const closed = sprints.find((s) => String(s.id) === filters.sprint)?.status === 'CLOSED';
      if (closed) setFilters((f) => ({ ...f, sprint: '' }));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-extrabold text-[22px] leading-none" style={{ letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Tasks
          </h1>
          <p className="text-[12px] mt-1.5" style={{ color: 'var(--text-secondary)' }}>
            {project.projectName}{selectedSprint ? ` · ${selectedSprint.sprintName}` : activeSprint ? ` · ${activeSprint.sprintName}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex rounded-lg p-0.5 gap-0.5" style={{ background: 'var(--bg-card-alt)' }}>
            {['kanban', 'list'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all"
                style={{
                  background: view === v ? 'var(--bg-card)' : 'transparent',
                  color: view === v ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.09)' : 'none',
                }}
              >
                {v[0].toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {isManager ? (
            <>
              <button
                onClick={() => setShowImport(true)}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors"
              >
                Import
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-navy hover:bg-navy-deep transition-colors"
              >
                <PlusIcon /> New task
              </button>
            </>
          ) : (
            <span className="text-xs text-gray-400 italic">Only managers can create tasks</span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <FilterSelect
          value={filters.status}
          onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
          options={STATUS_OPTIONS}
          placeholder="All statuses"
          showDot
        />
        <FilterSelect
          value={filters.sprint}
          onChange={(v) => setFilters((f) => ({ ...f, sprint: v }))}
          options={visibleSprints.map((s) => ({
            value: String(s.id),
            label: s.sprintName + (s.status === 'CLOSED' ? ' (closed)' : ''),
          }))}
          placeholder="All sprints"
        />
        <FilterSelect
          value={filters.priority}
          onChange={(v) => setFilters((f) => ({ ...f, priority: v }))}
          options={PRIORITY_OPTIONS}
          placeholder="All priorities"
          showDot
        />
        <button
          onClick={(e) => handleShowClosedToggle({ target: { checked: !showClosed } })}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all select-none"
          style={{
            background: showClosed ? '#003865' : 'var(--bg-input)',
            borderColor: showClosed ? '#003865' : 'var(--border)',
            color: showClosed ? 'white' : 'var(--text-secondary)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} style={{ opacity: showClosed ? 1 : 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Closed sprints
        </button>
      </div>

      {error && <p className="text-sm text-oracle bg-oracle-light rounded-lg px-3 py-2 mb-4">{error}</p>}

      {loading ? <LoadingSpinner /> : (
        view === 'kanban'
          ? <KanbanBoard tasks={tasks} onTaskClick={setSelectedTask} onStatusChange={handleStatusChange} />
          : <TaskTable tasks={tasks} onTaskClick={setSelectedTask} />
      )}

      {/* Modals */}
      <Modal open={!!selectedTask} onClose={() => setSelectedTask(null)} title="Task detail" size="lg">
        {selectedTask && (
          <TaskDetail
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onStatusChange={handleStatusChange}
            onEdit={(t) => { setEditTask(t); setSelectedTask(null); }}
            onDelete={setConfirmDelete}
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
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Enter the actual hours spent on <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{donePrompt?.task?.taskName}</span>.
          </p>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Actual hours <span className="text-oracle">*</span>
            </label>
            <input
              type="number" min="0.1" step="0.5"
              value={actualHoursInput}
              onChange={(e) => setActualHoursInput(e.target.value)}
              placeholder="e.g. 3.5"
              className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-navy-mid focus:ring-2 focus:ring-navy-mid/10 transition-all"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleDoneConfirm(); }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setDonePrompt(null)} className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors" style={{ color: 'var(--text-primary)', background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
              Cancel
            </button>
            <button onClick={handleDoneConfirm} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-navy hover:bg-navy-deep transition-colors">
              Confirm DONE
            </button>
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
