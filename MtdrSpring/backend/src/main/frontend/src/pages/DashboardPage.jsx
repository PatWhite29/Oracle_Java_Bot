import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { sprintService } from '../services/sprintService';
import FilterSelect from '../components/common/FilterSelect';
import SprintSummary from '../components/dashboard/SprintSummary';
import CompletionRate from '../components/dashboard/CompletionRate';
import AvgHoursPerSP from '../components/dashboard/AvgHoursPerSP';
import BlockedAlert from '../components/dashboard/BlockedAlert';
import VelocityChart from '../components/dashboard/VelocityChart';
import EfficiencyChart from '../components/dashboard/EfficiencyChart';
import WorkloadTable from '../components/dashboard/WorkloadTable';
import HoursPerMember from '../components/dashboard/HoursPerMember';
import BacklogSummary from '../components/dashboard/BacklogSummary';
import TasksByDeveloperChart from '../components/dashboard/TasksByDeveloperChart';
import HoursByDeveloperChart from '../components/dashboard/HoursByDeveloperChart';
import ComparePanel from '../components/dashboard/ComparePanel';

export function Widget({ title, children, className = '' }) {
  return (
    <div
      className={`bg-white rounded-xl p-5 flex flex-col gap-3 ${className}`}
      style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{title}</h2>
      {children}
    </div>
  );
}

function sprintLabel(s) {
  const tag = { ACTIVE: ' · Active', CLOSED: ' · Closed', PLANNING: ' · Planning' }[s.status] ?? '';
  return s.sprintName + tag;
}

export default function DashboardPage() {
  const { project } = useProject();

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-extrabold text-gray-900 text-[22px] leading-none" style={{ letterSpacing: '-0.02em' }}>
            Dashboard
          </h1>
          <p className="text-[12px] text-gray-500 mt-1.5">{project.projectName}</p>
        </div>
        <FilterSelect
          value={selectedSprintId ? String(selectedSprintId) : ''}
          onChange={(v) => setSelectedSprintId(v ? Number(v) : null)}
          options={sprints.map((s) => ({ value: String(s.id), label: sprintLabel(s) }))}
          placeholder="No sprint selected"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">

        {/* Sprint Summary */}
        <Widget title="Sprint Summary" className="sm:col-span-2 md:col-span-6">
          <SprintSummary sprintId={sid} />
        </Widget>

        {/* KPI row */}
        <Widget title="Completion Rate" className="md:col-span-2">
          <CompletionRate sprintId={sid} />
        </Widget>
        <Widget title="Avg Hours / Story Point" className="md:col-span-2">
          <AvgHoursPerSP sprintId={sid} />
        </Widget>
        <Widget title="Blocked Tasks" className="md:col-span-2">
          <BlockedAlert sprintId={sid} />
        </Widget>

        {/* Charts row */}
        <Widget title="Velocity (SP per sprint)" className="sm:col-span-2 md:col-span-3">
          <VelocityChart />
        </Widget>
        <Widget title="Efficiency (SP vs Hours)" className="sm:col-span-2 md:col-span-3">
          <EfficiencyChart sprintId={sid} />
        </Widget>

        {/* Tables row */}
        <Widget title="Workload" className="sm:col-span-2 md:col-span-3">
          <WorkloadTable sprintId={sid} />
        </Widget>
        <Widget title="Hours per Member" className="sm:col-span-2 md:col-span-3">
          <HoursPerMember sprintId={sid} />
        </Widget>

        {/* Backlog */}
        <Widget title="Backlog Summary" className="sm:col-span-2 md:col-span-6">
          <BacklogSummary />
        </Widget>

        {/* Developer charts — last 3 sprints, top 8 by volume */}
        <Widget title="Tasks Completed by Developer" className="sm:col-span-2 md:col-span-6">
          <TasksByDeveloperChart sprints={sprints} />
        </Widget>
        <Widget title="Hours Worked by Developer" className="sm:col-span-2 md:col-span-6">
          <HoursByDeveloperChart sprints={sprints} />
        </Widget>

        {/* Compare panel */}
        <Widget title="Compare" className="sm:col-span-2 md:col-span-6">
          <ComparePanel sprints={sprints} />
        </Widget>

      </div>
    </div>
  );
}
