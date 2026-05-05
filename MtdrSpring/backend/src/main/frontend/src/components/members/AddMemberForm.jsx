import React, { useState } from 'react';

export default function AddMemberForm({ onAdd, loading }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    onAdd(email.trim());
    setEmail('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="user@example.com"
        className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy-mid focus:ring-2 focus:ring-navy-mid/10 transition-all"
        style={{ border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
      />
      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-navy hover:bg-navy-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Adding…' : 'Add'}
      </button>
    </form>
  );
}
