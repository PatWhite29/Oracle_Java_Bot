import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { sprintService } from '../services/sprintService';
import SprintSummary from '../components/dashboard/SprintSummary';
import CompletionRate from '../components/dashboard/CompletionRate';
import AvgHoursPerSP from '../components/dashboard/AvgHoursPerSP';
import BlockedAlert from '../components/dashboard/BlockedAlert';
import VelocityChart from '../components/dashboard/VelocityChart';
import EfficiencyChart from '../components/dashboard/EfficiencyChart';
import WorkloadTable from '../components/dashboard/WorkloadTable';
import HoursPerMember from '../components/dashboard/HoursPerMember';
import BacklogSummary from '../components/dashboard/BacklogSummary';

function Widget({ title, children, className = '' }) {
  return (
    <div className={`bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4 ${className}`}>
      <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      {children}
    </div>
  );
}

function sprintLabel(s) {
  const tag = s.status === 'ACTIVE' ? ' (active)' : s.status === 'CLOSED' ? ' (closed)' : ' (planning)';
  return s.sprintName + tag;
}

export default function DashboardPage() {
  const { project, userRole } = useProject();
  const navigate = useNavigate();
  const isManager = userRole === 'MANAGER';

  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState(null);

  useEffect(() => {
    sprintService.list(project.id).then((data) => {
      setSprints(data);
      const active = data.find((s) => s.status === 'ACTIVE');
      if (active) {
        setSelectedSprintId(active.id);
      } else {
        const closed = data
          .filter((s) => s.status === 'CLOSED')
          .sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
        if (closed.length > 0) setSelectedSprintId(closed[0].id);
        else if (data.length > 0) setSelectedSprintId(data[0].id);
      }
    }).catch(() => {});
  }, [project.id]);

  const sid = selectedSprintId || null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold text-gray-900">Dashboard — {project.projectName}</h1>
        <select
          value={selectedSprintId ?? ''}
          onChange={(e) => setSelectedSprintId(e.target.value ? Number(e.target.value) : null)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none w-full sm:max-w-[220px]"
        >
          <option value="">No sprint selected</option>
          {sprints.map((s) => (
            <option key={s.id} value={s.id}>{sprintLabel(s)}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">

        {/* Row 1 — full width */}
        <Widget title="Sprint Summary" className="sm:col-span-2 md:col-span-6">
          <SprintSummary sprintId={sid} />
        </Widget>

        {/* Row 2 — three equal columns */}
        <Widget title="Completion Rate" className="md:col-span-2">
          <CompletionRate sprintId={sid} />
        </Widget>
        <Widget title="Avg Hours / Story Point" className="md:col-span-2">
          <AvgHoursPerSP sprintId={sid} />
        </Widget>
        <Widget title="Blocked Tasks" className="md:col-span-2">
          <BlockedAlert sprintId={sid} />
        </Widget>

        {/* Row 3 — two halves */}
        <Widget title="Velocity (SP per sprint)" className="sm:col-span-2 md:col-span-3">
          <VelocityChart />
        </Widget>
        <Widget title="Efficiency (SP vs Hours)" className="sm:col-span-2 md:col-span-3">
          <EfficiencyChart sprintId={sid} />
        </Widget>

        {/* Row 4 — two halves */}
        <Widget title="Workload" className="sm:col-span-2 md:col-span-3">
          <WorkloadTable sprintId={sid} />
        </Widget>
        <Widget title="Hours per Member" className="sm:col-span-2 md:col-span-3">
          <HoursPerMember sprintId={sid} />
        </Widget>

        {/* Row 5 — full width */}
        <Widget title="Backlog Summary" className="sm:col-span-2 md:col-span-6">
          <BacklogSummary />
        </Widget>

        {isManager && (
          <Widget title="Manager actions" className="sm:col-span-2 md:col-span-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Manage members', path: 'members' },
                { label: 'Manage sprints', path: 'sprints' },
                { label: 'View backlog', path: 'backlog' },
                { label: 'Manage tasks', path: 'tasks' },
              ].map(({ label, path }) => (
                <button
                  key={path}
                  onClick={() => navigate(`/projects/${project.id}/${path}`)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors text-left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 19h20v2H2v-2zM2 6l5 7 5-7 5 7 5-7v11H2V6z" />
                  </svg>
                  {label}
                </button>
              ))}
            </div>
          </Widget>
        )}
      </div>
    </div>
  );
}
