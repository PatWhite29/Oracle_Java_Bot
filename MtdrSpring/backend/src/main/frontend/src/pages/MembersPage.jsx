import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { memberService } from '../services/memberService';
import MemberList from '../components/members/MemberList';
import AddMemberForm from '../components/members/AddMemberForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function MembersPage() {
  const { project, userRole } = useProject();
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const isManager = userRole === 'MANAGER';

  const load = () => {
    setLoading(true);
    memberService.list(project.id)
      .then((data) => {
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
        />
      )}
    </div>
  );
}
