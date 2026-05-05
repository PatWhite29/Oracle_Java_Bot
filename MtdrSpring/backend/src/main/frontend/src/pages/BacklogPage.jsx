import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { taskService } from '../services/taskService';
import { sprintService } from '../services/sprintService';
import TaskTable from '../components/tasks/TaskTable';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function BacklogPage() {
  const { project, userRole } = useProject();
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const isManager = userRole === 'MANAGER';

  const load = () => {
    setLoading(true);
    Promise.all([
      taskService.list(project.id, { size: 500 }),
      sprintService.list(project.id),
    ])
      .then(([taskData, sprintData]) => {
        setTasks((taskData.content || []).filter((t) => !t.sprint));
        setSprints(sprintData.filter((s) => s.status !== 'CLOSED'));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [project.id]);

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

  const handleMoveToSprint = async (sprintId) => {
    setMoving(true);
    try {
      await taskService.changeSprint(project.id, selectedTask.id, sprintId);
      setSelectedTask(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setMoving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-gray-900 text-[22px] leading-none" style={{ letterSpacing: '-0.02em' }}>
          Backlog
        </h1>
        <p className="text-[12px] text-gray-500 mt-1.5">{project.projectName}</p>
      </div>

      {error && <p className="text-sm text-oracle bg-oracle-light rounded-lg px-3 py-2 mb-4">{error}</p>}

      {loading ? <LoadingSpinner /> : (
        <>
          <p className="text-[12px] text-gray-400 mb-4">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} not assigned to a sprint
          </p>
          <TaskTable tasks={tasks} onTaskClick={setSelectedTask} />
        </>
      )}

      <Modal open={!!selectedTask} onClose={() => setSelectedTask(null)} title="Assign to sprint">
        {selectedTask && (
          <div className="space-y-4">
            {/* Task summary */}
            <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-2 border border-gray-100">
              <p className="text-[13px] font-semibold text-gray-900">{selectedTask.taskName}</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge value={selectedTask.status} />
                {selectedTask.priority && <Badge value={selectedTask.priority} />}
                <span className="text-[11px] font-mono text-gray-400">{selectedTask.storyPoints} SP</span>
                {selectedTask.assignedTo && (
                  <span className="text-[11px] text-gray-400">· {selectedTask.assignedTo.fullName}</span>
                )}
              </div>
            </div>

            {!isManager ? (
              <p className="text-sm text-gray-400">Only the project manager can assign tasks to a sprint.</p>
            ) : sprints.length === 0 ? (
              <p className="text-sm text-gray-400">No active or planning sprints available.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Move to sprint</p>
                <div className="flex flex-col gap-2">
                  {sprints.map((s) => (
                    <button
                      key={s.id}
                      disabled={moving}
                      onClick={() => handleMoveToSprint(s.id)}
                      className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-gray-200 hover:border-navy-mid hover:bg-navy-light/40 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <span className="text-[13px] font-semibold text-gray-800 group-hover:text-navy">{s.sprintName}</span>
                      <Badge value={s.status} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isManager && (
              <div className="pt-3 border-t border-gray-100">
                <button
                  onClick={() => setConfirmDelete(selectedTask)}
                  className="text-[12px] font-semibold text-oracle hover:text-oracle-dark transition-colors"
                >
                  Delete task
                </button>
              </div>
            )}
          </div>
        )}
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
    </div>
  );
}
