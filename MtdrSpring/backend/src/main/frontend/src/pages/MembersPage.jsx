import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { memberService } from '../services/memberService';
import { projectService } from '../services/projectService';
import MemberList from '../components/members/MemberList';
import AddMemberForm from '../components/members/AddMemberForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function MembersPage() {
  const { project, userRole, setMembers: setContextMembers } = useProject();
  const { user } = useAuth();
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [transferTarget, setTransferTarget] = useState(null);
  const [transferring, setTransferring] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');

  const isManager = userRole === 'MANAGER';

  const load = () => {
    setLoading(true);
    memberService.list(project.id)
      .then((data) => {
        setContextMembers(data);
        const allMembers = project.manager
          ? [project.manager, ...data.filter((m) => m.id !== project.manager.id)]
          : data;
        setMembers(allMembers);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [project.id]);

  const handleAdd = async (email) => {
    setAdding(true);
    try {
      await memberService.add(project.id, email);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setAdding(false); }
  };

  const doRemove = async () => {
    setRemoving(true);
    try {
      await memberService.remove(project.id, confirmRemove.id);
      setConfirmRemove(null);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setRemoving(false); }
  };

  const handleTransfer = async () => {
    if (!transferTarget) return;
    setTransferring(true);
    try {
      await projectService.transfer(project.id, transferTarget.id);
      setTransferTarget(null);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setTransferring(false); }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-[22px] leading-none" style={{ letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          Members
        </h1>
        <p className="text-[12px] mt-1.5" style={{ color: 'var(--text-secondary)' }}>
          {project.projectName} · {members.length} {members.length === 1 ? 'member' : 'members'}
        </p>
      </div>

      {isManager && (
        <div className="mb-6">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Add member</p>
          <AddMemberForm onAdd={handleAdd} loading={adding} />
        </div>
      )}

      {error && <p className="text-sm text-oracle bg-oracle-light rounded-lg px-3 py-2 mb-4">{error}</p>}
      {loading ? <LoadingSpinner /> : (
        <MemberList
          members={members}
          managerId={project.manager?.id}
          currentUserId={user?.id}
          isManager={isManager}
          onRemove={setConfirmRemove}
          onTransfer={setTransferTarget}
        />
      )}

      <Modal open={!!transferTarget} onClose={() => setTransferTarget(null)} title="Transfer ownership">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Transfer ownership of <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{project.projectName}</span> to{' '}
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{transferTarget?.fullName}</span>?
          </p>
          <p className="text-[12px] text-gray-400">
            You will become a regular member. This action can be reversed by the new manager.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setTransferTarget(null)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleTransfer}
              disabled={transferring}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-navy hover:bg-navy-deep transition-colors disabled:opacity-50"
            >
              {transferring ? 'Transferring…' : 'Transfer ownership'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={doRemove}
        title="Remove member"
        message={`Remove ${confirmRemove?.fullName} from this project? They will lose access immediately.`}
        confirmLabel="Remove"
        variant="danger"
        loading={removing}
      />
    </div>
  );
}
