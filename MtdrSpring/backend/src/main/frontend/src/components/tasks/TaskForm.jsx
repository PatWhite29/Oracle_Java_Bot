import React, { useState } from 'react';
import FilterSelect from '../common/FilterSelect';

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

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-navy-mid focus:ring-2 focus:ring-navy-mid/10 transition-all';
const labelCls = 'block text-xs font-semibold text-gray-700 mb-1.5';

function initials(name) {
  return name?.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? '?';
}

export default function TaskForm({ initial = {}, sprints = [], members = [], onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    taskName:    initial.taskName    || '',
    description: initial.description || '',
    status:      initial.status      || 'TODO',
    priority:    initial.priority    || '',
    storyPoints: initial.storyPoints ?? 1,
    sprintId:    initial.sprintId ? String(initial.sprintId) : (initial.sprint?.id ? String(initial.sprint.id) : ''),
    assignedTo:  initial.assignedTo?.id ? String(initial.assignedTo.id) : '',
  });

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));
  const setEvent = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

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
      sprintId:   form.sprintId   || null,
      assignedTo: form.assignedTo || null,
    });
  };

  const sprintOptions = sprints.map((s) => ({ value: String(s.id), label: s.sprintName }));
  const memberOptions = members.map((m) => ({ value: String(m.id), label: m.fullName }));

  const selectedMember = members.find((m) => String(m.id) === form.assignedTo);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Task name */}
      <div>
        <label className={labelCls}>Task name <span className="text-oracle">*</span></label>
        <input
          required
          value={form.taskName}
          onChange={setEvent('taskName')}
          className={inputCls}
          placeholder="e.g. Implement login endpoint"
        />
      </div>

      {/* Description */}
      <div>
        <label className={labelCls}>Description</label>
        <textarea
          value={form.description}
          onChange={setEvent('description')}
          rows={3}
          className={`${inputCls} resize-none`}
          placeholder="Optional details…"
        />
      </div>

      {/* Status + Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Status</label>
          <FilterSelect
            value={form.status}
            onChange={set('status')}
            options={STATUS_OPTIONS}
            placeholder="Select status"
            showDot
            fullWidth
          />
        </div>
        <div>
          <label className={labelCls}>Priority <span className="text-oracle">*</span></label>
          <FilterSelect
            value={form.priority}
            onChange={set('priority')}
            options={PRIORITY_OPTIONS}
            placeholder="Select priority"
            showDot
            fullWidth
          />
        </div>
      </div>

      {/* Story points + Sprint */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Story points <span className="text-oracle">*</span></label>
          <input
            type="number" min={0} required
            value={form.storyPoints}
            onChange={setEvent('storyPoints')}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Sprint</label>
          <FilterSelect
            value={form.sprintId}
            onChange={set('sprintId')}
            options={sprintOptions}
            placeholder="Backlog"
            fullWidth
          />
        </div>
      </div>

      {/* Assigned to */}
      <div>
        <label className={labelCls}>Assigned to</label>
        <FilterSelect
          value={form.assignedTo}
          onChange={set('assignedTo')}
          options={memberOptions}
          placeholder="Unassigned"
          fullWidth
        />
        {selectedMember && (
          <div className="flex items-center gap-2 mt-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
              style={{ background: '#E8F0F7', color: '#003865' }}>
              {initials(selectedMember.fullName)}
            </div>
            <span className="text-[11px] text-gray-500">{selectedMember.fullName}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !isValid}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-navy hover:bg-navy-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}
