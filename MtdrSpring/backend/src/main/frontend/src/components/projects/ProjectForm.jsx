import React, { useState } from 'react';
import Button from '../common/Button';

export default function ProjectForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    projectName: initial.projectName || '',
    description: initial.description || '',
    status: initial.status || 'ACTIVE',
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const isValid = form.projectName.trim().length > 0;

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Project name *</label>
        <input
          required value={form.projectName} onChange={set('projectName')}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description} onChange={set('description')} rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
        />
      </div>
      {initial.id && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={form.status} onChange={set('status')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300">
            {['ACTIVE', 'PAUSED', 'CLOSED'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading || !isValid}>{loading ? 'Saving...' : 'Save'}</Button>
      </div>
    </form>
  );
}
