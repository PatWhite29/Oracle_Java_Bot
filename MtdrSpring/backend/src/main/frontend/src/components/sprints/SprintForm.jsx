import React, { useState } from 'react';

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-navy-mid focus:ring-2 focus:ring-navy-mid/10 transition-all';
const labelCls = 'block text-xs font-semibold text-gray-700 mb-1.5';

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
        <label className={labelCls}>
          Sprint name <span className="text-oracle">*</span>
        </label>
        <input required value={form.sprintName} onChange={set('sprintName')} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Goal</label>
        <textarea value={form.goal} onChange={set('goal')} rows={2} className={`${inputCls} resize-none`} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>
            Start date <span className="text-oracle">*</span>
          </label>
          <input type="date" required value={form.startDate} onChange={set('startDate')} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>
            End date <span className="text-oracle">*</span>
          </label>
          <input type="date" required value={form.endDate} onChange={set('endDate')} className={inputCls} />
        </div>
      </div>
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
