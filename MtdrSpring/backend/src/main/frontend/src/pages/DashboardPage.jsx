import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { dashboardService } from '../services/dashboardService';
import { sprintService } from '../services/sprintService';
import SprintSummary from '../components/dashboard/SprintSummary';
import VelocityChart from '../components/dashboard/VelocityChart';
import BurndownChart from '../components/dashboard/BurndownChart';
import WorkloadChart from '../components/dashboard/WorkloadChart';
import BacklogSummary from '../components/dashboard/BacklogSummary';
import LoadingSpinner from '../components/common/LoadingSpinner';

function Section({ title, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3">
      <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const { project } = useProject();
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState('');
  const [summary, setSummary] = useState(null);
  const [velocity, setVelocity] = useState([]);
  const [burndown, setBurndown] = useState(null);
  const [workload, setWorkload] = useState([]);
  const [backlog, setBacklog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sprintService.list(project.id).then((data) => {
      setSprints(data);
      const active = data.find((s) => s.status === 'ACTIVE');
      if (active) setSelectedSprintId(String(active.id));
    }).catch(() => {});
  }, [project.id]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      dashboardService.sprintSummary(project.id, selectedSprintId || null),
      dashboardService.velocity(project.id),
      dashboardService.burndown(project.id, selectedSprintId || null),
      dashboardService.workload(project.id),
      dashboardService.backlog(project.id),
    ])
      .then(([sum, vel, burn, work, back]) => {
        setSummary(sum);
        setVelocity(vel);
        setBurndown(burn);
        setWorkload(work);
        setBacklog(back);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [project.id, selectedSprintId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Dashboard — {project.projectName}</h1>
        <select
          value={selectedSprintId}
          onChange={(e) => setSelectedSprintId(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
        >
          <option value="">All sprints</option>
          {sprints.map((s) => <option key={s.id} value={s.id}>{s.sprintName}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Sprint Summary">
            <SprintSummary data={summary} />
          </Section>
          <Section title="Velocity (SP per sprint)">
            <VelocityChart data={velocity} />
          </Section>
          <Section title="Burndown">
            <BurndownChart data={burndown} />
          </Section>
          <Section title="Workload">
            <WorkloadChart data={workload} />
          </Section>
          <Section title="Backlog">
            <BacklogSummary data={backlog} />
          </Section>
        </div>
      )}
    </div>
  );
}
