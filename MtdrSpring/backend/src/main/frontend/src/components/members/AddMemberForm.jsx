import React, { useState } from 'react';
import Button from '../common/Button';

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
        type="email" required value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="user@example.com"
        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
      />
      <Button type="submit" disabled={loading || !email.trim()}>{loading ? 'Adding...' : 'Add member'}</Button>
    </form>
  );
}
