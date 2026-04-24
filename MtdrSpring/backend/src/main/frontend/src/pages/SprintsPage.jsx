import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { sprintService } from '../services/sprintService';
import { taskService } from '../services/taskService';
import SprintList from '../components/sprints/SprintList';
import SprintForm from '../components/sprints/SprintForm';
import TaskTable from '../components/tasks/TaskTable';
import TaskDetail from '../components/tasks/TaskDetail';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function SprintsPage() {
  const { project, members, userRole } = useProject();
  const toast = useToast();
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedSprint, setSelectedSprint] = useState(null);
  const [sprintTasks, setSprintTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [taskSaving, setTaskSaving] = useState(false);

  const [confirmCloseSprint, setConfirmCloseSprint] = useState(null);
  const [confirmReopenSprint, setConfirmReopenSprint] = useState(null);
  const [confirmDeleteTask, setConfirmDeleteTask] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isManager = userRole === 'MANAGER';

  const load = () => {
    setLoading(true);
    sprintService.list(project.id)
      .then(setSprints)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [project.id]);

  const loadSprintTasks = (sprint) => {
    setSelectedSprint(sprint);
    setSprintTasks([]);
    setTasksLoading(true);
    taskService.list(project.id, { sprint: sprint.id })
      .then((data) => setSprintTasks(data.content || []))
      .catch(() => {})
      .finally(() => setTasksLoading(false));
  };

  const reloadSprintTasks = () => {
    if (!selectedSprint) return;
    taskService.list(project.id, { sprint: selectedSprint.id })
      .then((data) => setSprintTasks(data.content || []))
      .catch(() => {});
  };

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await sprintService.create(project.id, form);
      setShowCreate(false);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleActivate = async (sprint) => {
    try {
      await sprintService.activate(project.id, sprint.id);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleClose = (sprint) => {
    setConfirmCloseSprint(sprint);
  };

  const doCloseSprint = async () => {
    setActionLoading(true);
    try {
      await sprintService.close(project.id, confirmCloseSprint.id);
      setConfirmCloseSprint(null);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  };

  const handleReopen = (sprint) => {
    setConfirmReopenSprint(sprint);
  };

  const doReopenSprint = async () => {
    setActionLoading(true);
    try {
      await sprintService.reopen(project.id, confirmReopenSprint.id);
      setConfirmReopenSprint(null);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  };

  const handleStatusChange = async (task, status) => {
    try {
      const updated = await taskService.changeStatus(project.id, task.id, status);
      setSelectedTask(updated);
      reloadSprintTasks();
    } catch (err) { toast.error(err.message); }
  };

  const handleTaskUpdate = async (form) => {
    setTaskSaving(true);
    try {
      await taskService.update(project.id, editTask.id, form);
      setEditTask(null);
      setSelectedTask(null);
      reloadSprintTasks();
    } catch (err) { toast.error(err.message); }
    finally { setTaskSaving(false); }
  };

  const handleDelete = (task) => {
    setConfirmDeleteTask(task);
  };

  const doDeleteTask = async () => {
    setActionLoading(true);
    try {
      await taskService.delete(project.id, confirmDeleteTask.id);
      setConfirmDeleteTask(null);
      setSelectedTask(null);
      reloadSprintTasks();
    } catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  };

  const allMembers = project.manager
    ? [project.manager, ...members.filter((m) => m.id !== project.manager.id)]
    : members;

  const byDate = (a, b) => a.startDate.localeCompare(b.startDate);

  const openSprints = [
    ...sprints.filter((s) => s.status === 'ACTIVE'),
    ...sprints.filter((s) => s.status === 'PLANNING').sort(byDate),
  ];

  const closedSprints = sprints.filter((s) => s.status === 'CLOSED').sort(byDate);

  const listProps = { isManager, onActivate: handleActivate, onClose: handleClose, onReopen: handleReopen, onSelect: loadSprintTasks };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Sprints — {project.projectName}</h1>
        {isManager ? (
          <Button onClick={() => setShowCreate(true)}>New sprint</Button>
        ) : (
          <span className="text-xs text-gray-400 italic">Only managers can create sprints</span>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-8">
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Active & Planning</h2>
            <SprintList sprints={openSprints} {...listProps} />
          </div>
          {closedSprints.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Closed</h2>
              <SprintList sprints={closedSprints} {...listProps} />
            </div>
          )}
        </div>
      )}

      {/* Sprint tasks modal */}
      <Modal
        open={!!selectedSprint}
        onClose={() => { setSelectedSprint(null); setSprintTasks([]); }}
        title={selectedSprint ? selectedSprint.sprintName : ''}
        size="xl"
      >
        {selectedSprint && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge value={selectedSprint.status} />
              <span className="text-xs text-gray-400">
                {selectedSprint.startDate} → {selectedSprint.endDate}
              </span>
              {selectedSprint.goal && (
                <span className="text-xs text-gray-500 italic">{selectedSprint.goal}</span>
              )}
            </div>

            {tasksLoading ? (
              <LoadingSpinner />
            ) : sprintTasks.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No tasks in this sprint.</p>
            ) : (
              <TaskTable tasks={sprintTasks} onTaskClick={setSelectedTask} />
            )}
          </div>
        )}
      </Modal>

      {/* Task detail modal */}
      <Modal
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="Task detail"
        size="lg"
      >
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

      {/* Edit task modal */}
      <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit task">
        {editTask && (
          <TaskForm
            initial={editTask}
            sprints={sprints}
            members={allMembers}
            onSubmit={handleTaskUpdate}
            onCancel={() => setEditTask(null)}
            loading={taskSaving}
          />
        )}
      </Modal>

      {/* New sprint modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New sprint">
        <SprintForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} loading={saving} />
      </Modal>

      <ConfirmDialog
        open={!!confirmCloseSprint}
        onClose={() => setConfirmCloseSprint(null)}
        onConfirm={doCloseSprint}
        title="Close sprint"
        message={`Close "${confirmCloseSprint?.sprintName}"? All tasks will be frozen. You can reopen it later if needed.`}
        confirmLabel="Close sprint"
        variant="warning"
        loading={actionLoading}
      />

      <ConfirmDialog
        open={!!confirmReopenSprint}
        onClose={() => setConfirmReopenSprint(null)}
        onConfirm={doReopenSprint}
        title="Reopen sprint"
        message={`"${confirmReopenSprint?.sprintName}" will return to PLANNING. Its tasks will become editable again.`}
        confirmLabel="Reopen"
        variant="warning"
        loading={actionLoading}
      />

      <ConfirmDialog
        open={!!confirmDeleteTask}
        onClose={() => setConfirmDeleteTask(null)}
        onConfirm={doDeleteTask}
        title="Delete task"
        message={`"${confirmDeleteTask?.taskName}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
}
