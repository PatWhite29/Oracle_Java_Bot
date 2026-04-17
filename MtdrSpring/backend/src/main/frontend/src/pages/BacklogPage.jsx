import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { taskService } from '../services/taskService';
import { sprintService } from '../services/sprintService';
import TaskTable from '../components/tasks/TaskTable';
import TaskDetail from '../components/tasks/TaskDetail';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function BacklogPage() {
  const { project, members, userRole } = useProject();
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [error, setError] = useState('');

  const isManager = userRole === 'MANAGER';

  const load = () => {
    setLoading(true);
    Promise.all([
      taskService.list(project.id, { sprintId: 'null' }),
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

  const handleMoveToSprint = async (task, sprintId) => {
    try {
      await taskService.changeSprint(project.id, task.id, sprintId);
      load();
    } catch (err) { alert(err.message); }
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

      <Modal open={!!selectedTask} onClose={() => setSelectedTask(null)} title="Task detail" size="lg">
        {selectedTask && (
          <>
            <TaskDetail
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
              onStatusChange={handleStatusChange}
              onEdit={() => {}}
              onDelete={handleDelete}
            />
            {isManager && sprints.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-2">Move to sprint</p>
                <div className="flex flex-wrap gap-2">
                  {sprints.map((s) => (
                    <Button key={s.id} variant="secondary" onClick={() => handleMoveToSprint(selectedTask, s.id)}>
                      {s.sprintName}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
