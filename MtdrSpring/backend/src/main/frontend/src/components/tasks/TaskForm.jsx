import React, { useState } from 'react';
import Button from '../common/Button';

const STATUSES = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

export default function TaskForm({ initial = {}, sprints = [], members = [], onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    taskName: initial.taskName || '',
    description: initial.description || '',
    status: initial.status || 'TODO',
    priority: initial.priority || '',
    storyPoints: initial.storyPoints ?? 1,
    sprintId: initial.sprintId || '',
    assignedTo: initial.assignedTo?.id || '',
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const isValid =
    form.taskName.trim().length > 0 &&
    form.priority !== '' &&
    form.storyPoints !== '' &&
    Number(form.storyPoints) >= 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      storyPoints: Number(form.storyPoints),
      sprintId: form.sprintId || null,
      assignedTo: form.assignedTo || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Task name <span className="text-red-500">*</span></label>
        <input
          required
          value={form.taskName}
          onChange={set('taskName')}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={set('description')}
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={form.status} onChange={set('status')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300">
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority <span className="text-red-500">*</span></label>
          <select value={form.priority} onChange={set('priority')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300">
            <option value="">— select —</option>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Story points <span className="text-red-500">*</span></label>
          <input
            type="number" min={0} required
            value={form.storyPoints}
            onChange={set('storyPoints')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sprint</label>
          <select value={form.sprintId} onChange={set('sprintId')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300">
            <option value="">Backlog</option>
            {sprints.map((s) => <option key={s.id} value={s.id}>{s.sprintName}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned to</label>
        <select value={form.assignedTo} onChange={set('assignedTo')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300">
          <option value="">Unassigned</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.fullName}</option>)}
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading || !isValid}>{loading ? 'Saving...' : 'Save'}</Button>
      </div>
    </form>
  );
}
