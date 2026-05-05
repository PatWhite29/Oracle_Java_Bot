import React, { useState } from 'react';

const inputCls = 'w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-navy-mid focus:ring-2 focus:ring-navy-mid/10 transition-all';
const inputStyle = { border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)' };
const labelCls = 'block text-xs font-semibold mb-1.5';

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
        <label className={labelCls} style={{ color: 'var(--text-primary)' }}>
          Sprint name <span className="text-oracle">*</span>
        </label>
        <input required value={form.sprintName} onChange={set('sprintName')} className={inputCls} style={inputStyle} />
      </div>
      <div>
        <label className={labelCls} style={{ color: 'var(--text-primary)' }}>Goal</label>
        <textarea value={form.goal} onChange={set('goal')} rows={2} className={`${inputCls} resize-none`} style={inputStyle} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls} style={{ color: 'var(--text-primary)' }}>
            Start date <span className="text-oracle">*</span>
          </label>
          <input type="date" required value={form.startDate} onChange={set('startDate')} className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className={labelCls} style={{ color: 'var(--text-primary)' }}>
            End date <span className="text-oracle">*</span>
          </label>
          <input type="date" required value={form.endDate} onChange={set('endDate')} className={inputCls} style={inputStyle} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
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
