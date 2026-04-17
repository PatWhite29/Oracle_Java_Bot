import React, { useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { memberService } from '../../services/memberService';
import LoadingSpinner from '../common/LoadingSpinner';

export default function ProjectLayout() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { project, setProject, setMembers, setUserRole, clearProject } = useProject();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      projectService.get(projectId),
      memberService.list(projectId),
    ])
      .then(([proj, memberList]) => {
        if (cancelled) return;
        setProject(proj);
        setMembers(memberList);
        const isManager = proj.manager?.id === user?.id;
        setUserRole(isManager ? 'MANAGER' : 'MEMBER');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => {
      cancelled = true;
      clearProject();
    };
  }, [projectId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return <Outlet />;
}
