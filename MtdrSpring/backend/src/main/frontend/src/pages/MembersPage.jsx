import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { memberService } from '../services/memberService';
import { projectService } from '../services/projectService';
import MemberList from '../components/members/MemberList';
import AddMemberForm from '../components/members/AddMemberForm';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function MembersPage() {
  const { project, userRole, setMembers: setContextMembers } = useProject();
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [transferTarget, setTransferTarget] = useState(null);
  const [transferring, setTransferring] = useState(false);
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
    } catch (err) { setError(err.message); }
    finally { setAdding(false); }
  };

  const handleRemove = async (member) => {
    if (!window.confirm(`Remove ${member.fullName} from this project?`)) return;
    try {
      await memberService.remove(project.id, member.id);
      load();
    } catch (err) { setError(err.message); }
  };

  const handleTransfer = async () => {
    if (!transferTarget) return;
    setTransferring(true);
    try {
      await projectService.transfer(project.id, transferTarget.id);
      setTransferTarget(null);
      load();
    } catch (err) { setError(err.message); }
    finally { setTransferring(false); }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Members — {project.projectName}</h1>

      {isManager && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Add member by email</p>
          <AddMemberForm onAdd={handleAdd} loading={adding} />
        </div>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {loading ? <LoadingSpinner /> : (
        <MemberList
          members={members}
          managerId={project.manager?.id}
          currentUserId={user?.id}
          isManager={isManager}
          onRemove={handleRemove}
          onTransfer={setTransferTarget}
        />
      )}

      <Modal
        open={!!transferTarget}
        onClose={() => setTransferTarget(null)}
        title="Transfer ownership"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Transfer ownership of <span className="font-semibold">{project.projectName}</span> to{' '}
            <span className="font-semibold">{transferTarget?.fullName}</span>?
          </p>
          <p className="text-xs text-gray-400">
            You will become a regular member. This action can be reversed by the new manager.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setTransferTarget(null)}
              className="text-sm px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleTransfer}
              disabled={transferring}
              className="text-sm px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
            >
              {transferring ? 'Transferring…' : 'Transfer ownership'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
