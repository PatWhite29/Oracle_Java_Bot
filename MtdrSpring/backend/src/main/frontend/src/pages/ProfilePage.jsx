import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { apiFetch } from '../services/api';

const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

export default function ProfilePage() {
  const { user } = useAuth();
  const { project, userRole } = useProject();

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    newPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')
    : '?';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      const body = { fullName: form.fullName, email: form.email };
      if (form.newPassword) body.password = form.newPassword;
      await apiFetch('/users/me', { method: 'PUT', body: JSON.stringify(body) });
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, fullName: form.fullName, email: form.email }));
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-[22px] font-extrabold text-gray-900 mb-7" style={{ letterSpacing: '-0.02em' }}>
        Profile
      </h1>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {/* Top gradient bar */}
        <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #003865, #C74634)' }} />

        {/* Hero */}
        <div className="px-7 pt-7 pb-6 border-b border-gray-100 flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
            style={{ background: '#C74634' }}
          >
            <span className="font-display text-2xl font-extrabold text-white">{initials}</span>
          </div>
          <div>
            <div className="font-display text-lg font-bold text-gray-900">{user?.fullName}</div>
            <div className="text-[13px] text-gray-500 mt-0.5">{user?.email}</div>
            <div className="flex items-center gap-2 mt-2">
              {userRole === 'MANAGER' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded"
                  style={{ background: '#FEF9C3', color: '#A16207' }}>
                  <StarIcon /> Manager
                </span>
              )}
              {project && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded"
                  style={{ background: '#E8F0F7', color: '#005587' }}>
                  {project.projectName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-7 py-6">
          {success && (
            <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-5">{success}</p>
          )}
          {error && (
            <p className="text-sm text-oracle bg-oracle-light rounded-lg px-3 py-2 mb-5">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full name</label>
              <input
                required
                value={form.fullName}
                onChange={set('fullName')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900
                  focus:outline-none focus:border-navy-mid focus:ring-2 focus:ring-navy-mid/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={set('email')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900
                  focus:outline-none focus:border-navy-mid focus:ring-2 focus:ring-navy-mid/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">New password</label>
              <input
                type="password"
                value={form.newPassword}
                onChange={set('newPassword')}
                placeholder="Leave blank to keep current"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900
                  focus:outline-none focus:border-navy-mid focus:ring-2 focus:ring-navy-mid/10 transition-all"
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white
                  bg-navy hover:bg-navy-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ letterSpacing: '0.01em' }}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
