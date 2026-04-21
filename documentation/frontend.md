# Frontend Skill

Use this skill when working with React components, pages, routing, styling, or any frontend code.

## Tech Stack

- React with React Router for navigation.
- Tailwind CSS for styling.
- Context API for global state (auth, selected project).
- Fetch API (native) for HTTP communication with the backend.
- Frontend lives at: MtdrSpring/backend/src/main/frontend/

## Design Style

- Clean and minimalist. Lots of whitespace, few colors.
- Sidebar fija on the left with navigation. Main content area on the right.
- Consistent spacing, clear typography, no visual clutter.

## Layout

- Fixed sidebar (left): logo/app name at top, project list, navigation links, user profile at bottom.
- Main content area (right): renders the current route.
- Sidebar shows: My Projects, and when a project is selected: Tasks, Sprints, Backlog, Members, Dashboard.

## Pages / Views

### Auth (no sidebar)
- Login: email + password. Link to register.
- Register: full_name + email + password. Link to login.
- On success: store JWT in localStorage, redirect to projects.

### My Projects (sidebar visible)
- Cards grid showing projects where user is manager or member.
- Each card: project name, status badge, role indicator (Manager/Member), created date.
- Button to create new project (modal or dedicated page).

### Project Detail (sidebar shows project navigation)
- Sub-navigation in sidebar: Tasks, Sprints, Backlog, Members, Dashboard.
- Header with project name, status, manager info.

### Tasks
- Toggle between two views: Kanban board and List/Table.
- Kanban: 4 columns (TODO, IN_PROGRESS, BLOCKED, DONE). Cards show task name, assignee, story points, priority badge.
- List/Table: sortable columns, filterable by status, sprint, assigned_to, priority.
- Click task to open detail view (modal or side panel).
- Task detail: all fields, activity feed (comments + status changes + sprint changes), add comment form.

### Sprints
- List of sprints with status badges (PLANNING, ACTIVE, CLOSED).
- Active sprint highlighted.
- Sprint detail: tasks in the sprint, goal, dates, summary stats.
- Actions: create sprint, activate, close.

### Backlog
- Tasks without sprint (sprint = null).
- Ability to move tasks to a sprint.

### Members
- List of project members with name and email.
- Manager indicated.
- Add/remove members (manager only).

### Dashboard / KPIs

- **Sprint Summary**: cards showing tasks by status, SP committed vs completed, completion %, blocked count. Simple and complete.
- **Velocity**: bar chart of SP completed per sprint over last N closed sprints. Useful for comparing sprint output over time.
- **Efficiency**: bar chart per member comparing SP completed vs actual_hours worked in the active sprint. Derived from TASK.actual_hours (populated on DONE).
- **Completion Rate**: single large number (with green/yellow/red color) showing % of committed tasks that reached DONE in the active sprint.
- **Avg Hours per Story Point**: single large number showing actual_hours / story_points averaged across DONE tasks in the active sprint. Helps calibrate future estimations.
- **Workload**: scrollable table where each row is a member and columns are task statuses (TODO, IN_PROGRESS, BLOCKED, DONE). Toggle between task count and story points. Table layout scales correctly with any team size — no chart distortion with few or many members.
- **Hours per Member**: ranked list of members by total actual_hours on DONE tasks in the active sprint, displayed as a list with relative progress bars (scaled to the highest value). Scales well with any team size.
- **Blocked Alert**: counter of currently BLOCKED tasks with a list showing task name, assignee, and time blocked (derived from TASK_ACTIVITY timestamps).
- **Backlog Summary**: cards with total backlog tasks, total SP, and priority distribution (LOW/MEDIUM/HIGH).

### Profile
- View/edit own profile (full_name, email).

## Routing Structure

/login                                    → LoginPage
/register                                 → RegisterPage
/projects                                 → MyProjectsPage
/projects/:projectId                      → ProjectLayout (wrapper with sidebar)
/projects/:projectId/tasks                → TasksPage (kanban/list toggle)
/projects/:projectId/sprints              → SprintsPage
/projects/:projectId/backlog              → BacklogPage
/projects/:projectId/members              → MembersPage
/projects/:projectId/dashboard            → DashboardPage
/profile                                  → ProfilePage

## Context Providers

- AuthContext: JWT token, current user, login/logout/register methods.
- ProjectContext: selected project, members, role of current user in project.

## API Communication

- Base URL: /api/v1 (relative, same origin).
- All requests include Authorization: Bearer {token} header except auth endpoints.
- Utility function: apiFetch(endpoint, options) that wraps fetch with auth header and error handling.
- On 401 response: clear token, redirect to login.

## Component Organization

src/
├── components/              → Reusable UI components
│   ├── Layout/
│   │   ├── Sidebar.jsx
│   │   ├── ProjectLayout.jsx
│   │   └── AuthLayout.jsx
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── Badge.jsx
│   │   ├── Card.jsx
│   │   └── LoadingSpinner.jsx
│   ├── tasks/
│   │   ├── KanbanBoard.jsx
│   │   ├── KanbanColumn.jsx
│   │   ├── TaskCard.jsx
│   │   ├── TaskTable.jsx
│   │   ├── TaskDetail.jsx
│   │   └── TaskForm.jsx
│   ├── sprints/
│   │   ├── SprintList.jsx
│   │   ├── SprintCard.jsx
│   │   └── SprintForm.jsx
│   ├── projects/
│   │   ├── ProjectCard.jsx
│   │   └── ProjectForm.jsx
│   ├── members/
│   │   ├── MemberList.jsx
│   │   └── AddMemberForm.jsx
│   └── dashboard/
│       ├── SprintSummary.jsx
│       ├── VelocityChart.jsx
│       ├── EfficiencyChart.jsx
│       ├── CompletionRate.jsx
│       ├── AvgHoursPerSP.jsx
│       ├── WorkloadTable.jsx
│       ├── HoursPerMember.jsx
│       ├── BlockedAlert.jsx
│       └── BacklogSummary.jsx
├── pages/                   → Route-level page components
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── MyProjectsPage.jsx
│   ├── TasksPage.jsx
│   ├── SprintsPage.jsx
│   ├── BacklogPage.jsx
│   ├── MembersPage.jsx
│   ├── DashboardPage.jsx
│   └── ProfilePage.jsx
├── context/                 → React Context providers
│   ├── AuthContext.jsx
│   └── ProjectContext.jsx
├── services/                → API communication layer
│   ├── api.js               → apiFetch utility
│   ├── authService.js
│   ├── projectService.js
│   ├── sprintService.js
│   ├── taskService.js
│   ├── memberService.js
│   └── dashboardService.js
├── App.jsx                  → Router setup, context providers
└── index.jsx                → Entry point

## Code Generation Rules

- Use functional components with hooks only. No class components.
- Use Tailwind CSS classes for all styling. No inline styles, no CSS files.
- Keep components small and focused. Extract reusable pieces.
- Pages fetch data and pass to components. Components are presentational.
- All API calls go through services/ layer, never directly in components.
- Handle loading and error states in every page that fetches data.
- Protected routes: redirect to /login if no JWT token.
- Manager-only actions: check role from ProjectContext before rendering buttons/forms.