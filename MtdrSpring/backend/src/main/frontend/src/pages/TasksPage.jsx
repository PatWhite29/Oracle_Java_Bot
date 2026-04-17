import React, { useState, useEffect, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import { taskService } from '../services/taskService';
import { sprintService } from '../services/sprintService';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskTable from '../components/tasks/TaskTable';
import TaskDetail from '../components/tasks/TaskDetail';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function TasksPage() {
  const { project, members, userRole } = useProject();
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
    sprintService.list(project.id).then(setSprints).catch(() => {});
  }, [project.id]);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await taskService.create(project.id, form);
      setShowForm(false);
      load();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (form) => {
    setSaving(true);
    try {
      await taskService.update(project.id, editTask.id, form);
      setEditTask(null);
      setSelectedTask(null);
      load();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (task, status) => {
    try {
      const updated = await taskService.changeStatus(project.id, task.id, status);
      setSelectedTask(updated);
      load();
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete "${task.taskName}"?`)) return;
    try {
      await taskService.delete(project.id, task.id);
      setSelectedTask(null);
      load();
    } catch (err) { alert(err.message); }
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Tasks — {project.projectName}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('kanban')}
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${view === 'kanban' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >Kanban</button>
          <button
            onClick={() => setView('list')}
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${view === 'list' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >List</button>
          {isManager && <Button onClick={() => setShowForm(true)}>New task</Button>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
          <option value="">All statuses</option>
          {['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={filters.sprint} onChange={(e) => setFilters((f) => ({ ...f, sprint: e.target.value }))}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
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
          ? <KanbanBoard tasks={tasks} onTaskClick={setSelectedTask} />
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
    </div>
  );
}
