import React from 'react';
import StatusBadge from './StatusBadge';

function TaskTable({
  title,
  description,
  tasks,
  columns,
  emptyMessage,
  actionLabel,
  onAction,
}) {
  return (
    <section className="card section-card">
      <div className="section-header">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="task-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
              {actionLabel && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && (
              <tr>
                <td className="empty-state" colSpan={columns.length + (actionLabel ? 1 : 0)}>
                  {emptyMessage}
                </td>
              </tr>
            )}
            {tasks.map((task) => (
              <tr key={task.id}>
                {columns.map((column) => {
                  if (column.key === 'status') {
                    return (
                      <td key={column.key} data-label={column.label}>
                        <StatusBadge status={task.status} />
                      </td>
                    );
                  }

                  return (
                    <td key={column.key} data-label={column.label}>
                      {task[column.key]}
                    </td>
                  );
                })}
                {actionLabel && (
                  <td data-label="Action">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => onAction(task.id)}
                    >
                      {actionLabel}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default TaskTable;
