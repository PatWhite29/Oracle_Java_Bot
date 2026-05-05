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
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Project name <span className="text-oracle">*</span>
        </label>
        <input
          required
          value={form.projectName}
          onChange={set('projectName')}
          placeholder="e.g. Kairo v2"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900
            focus:outline-none focus:border-navy-mid focus:ring-2 focus:ring-navy-mid/10 transition-all"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
        <textarea
          value={form.description}
          onChange={set('description')}
          rows={3}
          placeholder="What is this project about?"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900
            focus:outline-none focus:border-navy-mid focus:ring-2 focus:ring-navy-mid/10 transition-all resize-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
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
