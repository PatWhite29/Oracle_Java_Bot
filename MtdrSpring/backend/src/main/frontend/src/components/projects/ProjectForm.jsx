import React, { useState } from 'react';

export default function ProjectForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    projectName: initial.projectName || '',
    description: initial.description || '',
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const isValid = form.projectName.trim().length > 0;

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
          Project name <span className="text-oracle">*</span>
        </label>
        <input
          required
          value={form.projectName}
          onChange={set('projectName')}
          placeholder="e.g. Kairo v2"
          className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-navy-mid focus:ring-2 focus:ring-navy-mid/10 transition-all"
          style={{ border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Description</label>
        <textarea
          value={form.description}
          onChange={set('description')}
          rows={3}
          placeholder="What is this project about?"
          className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-navy-mid focus:ring-2 focus:ring-navy-mid/10 transition-all resize-none"
          style={{ border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{ color: 'var(--text-primary)', background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}
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
