import React, { useState } from 'react';
import Button from '../common/Button';

export default function SprintForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    sprintName: initial.sprintName || '',
    goal: initial.goal || '',
    startDate: initial.startDate || '',
    endDate: initial.endDate || '',
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const isValid =
    form.sprintName.trim().length > 0 &&
    form.startDate.length > 0 &&
    form.endDate.length > 0 &&
    form.endDate > form.startDate;

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sprint name <span className="text-red-500">*</span></label>
        <input required value={form.sprintName} onChange={set('sprintName')}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
        <textarea value={form.goal} onChange={set('goal')} rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start date <span className="text-red-500">*</span></label>
          <input type="date" required value={form.startDate} onChange={set('startDate')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End date <span className="text-red-500">*</span></label>
          <input type="date" required value={form.endDate} onChange={set('endDate')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading || !isValid}>{loading ? 'Saving...' : 'Save'}</Button>
      </div>
    </form>
  );
}
