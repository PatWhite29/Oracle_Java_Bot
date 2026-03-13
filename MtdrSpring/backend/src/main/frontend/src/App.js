          /*
## MyToDoReact version 1.0.
##
## Copyright (c) 2022 Oracle, Inc.
## Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl/
*/
/*
 * This is the application main React component. We're using "function"
 * components in this application. No "class" components should be used for
 * consistency.
 * @author  jean.de.lavarene@oracle.com
 */
import React, { useEffect, useMemo, useState } from 'react';
import API_LIST from './API';
import SummaryCard from './components/SummaryCard';
import TaskTable from './components/TaskTable';

/* In this application we're using Function Components with the State Hooks
 * to manage the states. See the doc: https://reactjs.org/docs/hooks-state.html
 * This App component represents the entire app. It renders a NewItem component
 * and two tables: one that lists the todo items that are to be done and another
 * one with the items that are already done.
 */
const pendingTaskSeed = [
  {
    id: 'pending-1',
    title: 'Hacer Video Demo de app',
    assignee: 'Ana Torres',
    estimatedHours: 6,
    complexity: 'High',
    status: 'Pending',
  },
  {
    id: 'pending-2',
    title: 'Documentar horas por desarrollador',
    assignee: 'Luis García',
    estimatedHours: 4,
    complexity: 'Medium',
    status: 'Pending',
  },
  {
    id: 'pending-3',
    title: 'Revisar backlog Sprint 0',
    assignee: 'María Pérez',
    estimatedHours: 3,
    complexity: 'Low',
    status: 'Pending',
  },
];

const completedTaskSeed = [
  {
    id: 'completed-1',
    title: 'Configurar base de datos',
    assignee: 'Carlos Vega',
    workedHours: 8,
    status: 'Completed',
  },
  {
    id: 'completed-2',
    title: 'Conectar backend con Telegram',
    assignee: 'Sofía Rojas',
    workedHours: 10,
    status: 'Completed',
  },
  {
    id: 'completed-3',
    title: 'Crear modelo relacional',
    assignee: 'Diego Ruiz',
    workedHours: 5,
    status: 'Completed',
  },
];

const pendingColumns = [
  { key: 'title', label: 'Title' },
  { key: 'assignee', label: 'Assignee' },
  { key: 'estimatedHours', label: 'Estimated Hours' },
  { key: 'complexity', label: 'Complexity' },
  { key: 'status', label: 'Status' },
];

const completedColumns = [
  { key: 'title', label: 'Title' },
  { key: 'assignee', label: 'Assignee' },
  { key: 'workedHours', label: 'Worked Hours' },
  { key: 'status', label: 'Status' },
];

const initialFormState = {
  title: '',
  assignee: '',
  estimatedHours: '',
  complexity: 'Medium',
};

const REFRESH_INTERVAL_MS = 5000;

function normalizeTaskTitle(title) {
  return (title || '').trim().toLowerCase();
}

function mergeTasksByTitle(...taskGroups) {
  const seenTitles = new Set();

  return taskGroups.flat().filter((task) => {
    const normalizedTitle = normalizeTaskTitle(task.title);

    if (!normalizedTitle || seenTitles.has(normalizedTitle)) {
      return false;
    }

    seenTitles.add(normalizedTitle);
    return true;
  });
}

function mapApiTask(item) {
  const title = item.description || 'New task from bot';

  return {
    id: `api-${item.id ?? item.ID}`,
    apiId: item.id ?? item.ID,
    title,
    assignee: 'Telegram Bot',
    estimatedHours: '—',
    workedHours: '—',
    complexity: 'Medium',
    status: item.done ? 'Completed' : 'Pending',
    source: 'api',
    createdAt: item.createdAt || item.creation_ts || null,
    done: Boolean(item.done),
  };
}

function sortTasksByCreatedAt(tasks) {
  return [...tasks].sort((leftTask, rightTask) => {
    const leftDate = leftTask.createdAt ? new Date(leftTask.createdAt).getTime() : 0;
    const rightDate = rightTask.createdAt ? new Date(rightTask.createdAt).getTime() : 0;

    return rightDate - leftDate;
  });
}

function App() {
  const [localPendingTasks, setLocalPendingTasks] = useState([]);
  const [localCompletedTasks, setLocalCompletedTasks] = useState([]);
  const [apiTasks, setApiTasks] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      try {
        const response = await fetch(API_LIST);

        if (!response.ok) {
          throw new Error('Unable to load tasks from API');
        }

        const result = await response.json();

        if (isMounted) {
          const mappedTasks = sortTasksByCreatedAt((result || []).map(mapApiTask));
          setApiTasks(mappedTasks);
        }
      } catch (error) {
        if (isMounted) {
          setApiTasks((currentTasks) => currentTasks);
        }
      }
    }

    loadTasks();
    const intervalId = window.setInterval(loadTasks, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const pendingTasks = useMemo(
    () =>
      mergeTasksByTitle(
        apiTasks.filter((task) => !task.done),
        localPendingTasks,
        pendingTaskSeed
      ),
    [apiTasks, localPendingTasks]
  );

  const completedTasks = useMemo(
    () =>
      mergeTasksByTitle(
        apiTasks.filter((task) => task.done),
        localCompletedTasks,
        completedTaskSeed
      ),
    [apiTasks, localCompletedTasks]
  );

  const summary = useMemo(
    () => ({
      total: pendingTasks.length + completedTasks.length,
      pending: pendingTasks.length,
      completed: completedTasks.length,
    }),
    [pendingTasks, completedTasks]
  );

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleCreateTask(event) {
    event.preventDefault();

    if (!formData.title.trim() || !formData.assignee.trim() || !formData.estimatedHours) {
      return;
    }

    const newTask = {
      id: `pending-${Date.now()}`,
      title: formData.title.trim(),
      assignee: formData.assignee.trim(),
      estimatedHours: Number(formData.estimatedHours),
      complexity: formData.complexity,
      status: 'Pending',
      source: 'local',
    };

    setLocalPendingTasks((currentTasks) => [newTask, ...currentTasks]);
    setFormData(initialFormState);
  }

  async function handleCompleteTask(taskId) {
    const taskToMove = pendingTasks.find((task) => task.id === taskId);

    if (!taskToMove) {
      return;
    }

    if (taskToMove.source === 'api') {
      try {
        const response = await fetch(`${API_LIST}/${taskToMove.apiId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: taskToMove.title,
            done: true,
          }),
        });

        if (!response.ok) {
          throw new Error('Unable to update task');
        }

        setApiTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.apiId === taskToMove.apiId
              ? {
                  ...task,
                  done: true,
                  status: 'Completed',
                }
              : task
          )
        );
      } catch (error) {
        return;
      }

      return;
    }

    setLocalPendingTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
    setLocalCompletedTasks((currentTasks) => [
      {
        id: `completed-${taskToMove.id}`,
        title: taskToMove.title,
        assignee: taskToMove.assignee,
        workedHours: taskToMove.estimatedHours,
        status: 'Completed',
      },
      ...currentTasks,
    ]);
  }

  return (
    <div className="app-shell">
      <header className="hero-card">
        <div>
          <span className="eyebrow">Team 33</span>
          <h1>Software Manager Tool</h1>
          <p>Team 33 Challenge Demo</p>
        </div>
        <div className="hero-note">
          <span className="hero-note-label">Live Sync</span>
          <strong>Auto-refreshes every 5 seconds to show tasks received by the bot.</strong>
          <small className="hero-note-footnote">Source: {API_LIST}</small>
        </div>
      </header>

      <section className="summary-grid">
        <SummaryCard label="Total Tasks" value={summary.total} accentClass="accent-primary" />
        <SummaryCard label="Pending Tasks" value={summary.pending} accentClass="accent-muted" />
        <SummaryCard label="Completed Tasks" value={summary.completed} accentClass="accent-success" />
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2>Create Task</h2>
            <p>Register a new task for the project management demo dashboard.</p>
          </div>
        </div>

        <form className="task-form" onSubmit={handleCreateTask}>
          <div className="form-grid">
            <label>
              <span>Task title</span>
              <input
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter task title"
              />
            </label>

            <label>
              <span>Assignee</span>
              <input
                name="assignee"
                type="text"
                value={formData.assignee}
                onChange={handleInputChange}
                placeholder="Enter team member"
              />
            </label>

            <label>
              <span>Estimated hours</span>
              <input
                name="estimatedHours"
                type="number"
                min="1"
                value={formData.estimatedHours}
                onChange={handleInputChange}
                placeholder="0"
              />
            </label>

            <label>
              <span>Complexity</span>
              <select name="complexity" value={formData.complexity} onChange={handleInputChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-button">
              Create Task
            </button>
          </div>
        </form>
      </section>

      <TaskTable
        title="Pending Tasks"
        description="Open work items prepared for the challenge review and demo presentation, including new tasks created by Telegram messages."
        tasks={pendingTasks}
        columns={pendingColumns}
        actionLabel="Complete"
        onAction={handleCompleteTask}
        emptyMessage="There are no pending tasks right now."
      />

      <TaskTable
        title="Completed Tasks"
        description="Delivered tasks already closed by the team during the challenge preparation."
        tasks={completedTasks}
        columns={completedColumns}
        emptyMessage="Completed tasks will appear here once work is closed."
      />
    </div>
  );
}
export default App;
