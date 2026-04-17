import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { taskService } from '../services/taskService';
import { sprintService } from '../services/sprintService';
import TaskTable from '../components/tasks/TaskTable';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function BacklogPage() {
  const { project, userRole } = useProject();
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState('');

  const isManager = userRole === 'MANAGER';

  const load = () => {
    setLoading(true);
    Promise.all([
      taskService.list(project.id, {}),
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

  const handleMoveToSprint = async (sprintId) => {
    setMoving(true);
    try {
      await taskService.changeSprint(project.id, selectedTask.id, sprintId);
      setSelectedTask(null);
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setMoving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Backlog — {project.projectName}</h1>
      </div>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {loading ? <LoadingSpinner /> : (
        <>
          <p className="text-sm text-gray-500 mb-4">{tasks.length} task(s) not assigned to a sprint.</p>
          <TaskTable tasks={tasks} onTaskClick={setSelectedTask} />
        </>
      )}

      <Modal open={!!selectedTask} onClose={() => setSelectedTask(null)} title="Assign to sprint">
        {selectedTask && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg px-4 py-3 space-y-2">
              <p className="text-sm font-semibold text-gray-900">{selectedTask.taskName}</p>
              <div className="flex flex-wrap gap-2">
                <Badge value={selectedTask.status} />
                {selectedTask.priority && <Badge value={selectedTask.priority} />}
                <span className="text-xs text-gray-400">{selectedTask.storyPoints} SP</span>
                {selectedTask.assignedTo && (
                  <span className="text-xs text-gray-400">→ {selectedTask.assignedTo.fullName}</span>
                )}
              </div>
            </div>

            {!isManager ? (
              <p className="text-sm text-gray-400">Only the project manager can assign tasks to a sprint.</p>
            ) : sprints.length === 0 ? (
              <p className="text-sm text-gray-400">No active or planning sprints available.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Select a sprint to move this task:</p>
                <div className="flex flex-col gap-2">
                  {sprints.map((s) => (
                    <button
                      key={s.id}
                      disabled={moving}
                      onClick={() => handleMoveToSprint(s.id)}
                      className="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="font-medium text-gray-800">{s.sprintName}</span>
                      <Badge value={s.status} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
