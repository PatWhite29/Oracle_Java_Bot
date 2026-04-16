# API Skill

Use this skill when working with controllers, DTOs, endpoint logic, request/response handling, or any REST API work.

## Conventions

- Base prefix: /api/v1
- URL strategy: nested routes (resources live under their parent)
- Updates: PUT (full object replacement)
- Pagination: offset-based with Spring Data Pageable (?page=0&size=20)
- Filtering: query params on list endpoints (status, sprint, assigned_to, priority)
- Error format: { error: string, message: string, status: number }
- Auth: JWT in Authorization header. Public endpoints: /api/v1/auth/register, /api/v1/auth/login only.
- Special actions (close, activate, transfer): dedicated POST endpoints, not PUT with status change.
- Burndown: simplified — current SP completed vs ideal line based on elapsed sprint time. No snapshot table.

## HTTP Status Codes

- 200: successful GET, PUT
- 201: successful POST (resource created)
- 204: successful DELETE
- 400: validation error, invalid input
- 401: not authenticated (missing/invalid JWT)
- 403: forbidden (not manager, not member of project, not assigned to task)
- 404: resource not found
- 409: conflict (e.g., trying to activate a sprint when one is already active)

## Permission Legend

- ANY: any authenticated user
- MANAGER: PROJECT.manager of the relevant project
- MEMBER: row in PROJECT_MEMBER for the relevant project
- PARTICIPANT: Manager OR Member of the project
- ASSIGNED: the user in TASK.assigned_to

## Endpoints

### Auth (public)

POST   /api/v1/auth/register              → Register new user. Body: { full_name, email, password }. Returns: user object + JWT.
POST   /api/v1/auth/login                  → Login. Body: { email, password }. Returns: JWT.

### Projects

POST   /api/v1/projects                    → Create project. Caller becomes manager. Body: { project_name, description }. Permission: ANY.
GET    /api/v1/projects                    → List my projects (where I am manager or member). Paginated. Permission: ANY.
GET    /api/v1/projects/{projectId}        → Project detail. Permission: PARTICIPANT.
PUT    /api/v1/projects/{projectId}        → Edit project. Body: { project_name, description }. Permission: MANAGER.
DELETE /api/v1/projects/{projectId}        → Delete project. Permission: MANAGER.
POST   /api/v1/projects/{projectId}/close  → Close project. Returns warning with affected sprints/tasks count before executing. Permission: MANAGER.
POST   /api/v1/projects/{projectId}/transfer → Transfer ownership. Body: { new_manager_id }. Permission: MANAGER.

### Project Members

POST   /api/v1/projects/{projectId}/members              → Add member. Body: { user_id }. Permission: MANAGER.
GET    /api/v1/projects/{projectId}/members              → List members. Paginated. Permission: PARTICIPANT.
DELETE /api/v1/projects/{projectId}/members/{userId}     → Remove member. Permission: MANAGER.

### Sprints

POST   /api/v1/projects/{projectId}/sprints                          → Create sprint. Body: { sprint_name, goal, start_date, end_date }. Permission: MANAGER.
GET    /api/v1/projects/{projectId}/sprints                          → List sprints. Paginated. Permission: PARTICIPANT.
GET    /api/v1/projects/{projectId}/sprints/{sprintId}               → Sprint detail. Permission: PARTICIPANT.
PUT    /api/v1/projects/{projectId}/sprints/{sprintId}               → Edit sprint. Body: { sprint_name, goal, start_date, end_date }. Permission: MANAGER.
POST   /api/v1/projects/{projectId}/sprints/{sprintId}/activate      → Activate sprint. Returns 409 if another sprint is active. Permission: MANAGER.
POST   /api/v1/projects/{projectId}/sprints/{sprintId}/close         → Close sprint. Tasks become read-only. Permission: MANAGER.

### Tasks

POST   /api/v1/projects/{projectId}/tasks                           → Create task. Body: { task_name, description, status, priority, story_points, assigned_to, sprint }. Permission: MANAGER.
GET    /api/v1/projects/{projectId}/tasks                           → List tasks. Paginated. Filters: ?status=TODO&sprint=5&assigned_to=3&priority=HIGH. Permission: PARTICIPANT.
GET    /api/v1/projects/{projectId}/tasks/{taskId}                  → Task detail (includes latest activity). Permission: PARTICIPANT.
PUT    /api/v1/projects/{projectId}/tasks/{taskId}                  → Edit task (full replacement). Permission: MANAGER.
DELETE /api/v1/projects/{projectId}/tasks/{taskId}                  → Delete task. Permission: MANAGER.
PUT    /api/v1/projects/{projectId}/tasks/{taskId}/status           → Change task status. Body: { status }. Permission: MANAGER or ASSIGNED.
PUT    /api/v1/projects/{projectId}/tasks/{taskId}/sprint           → Move task to sprint or backlog. Body: { sprint_id } (null for backlog). Permission: MANAGER.

### Task Activity

POST   /api/v1/projects/{projectId}/tasks/{taskId}/comments         → Add comment. Body: { content }. Permission: PARTICIPANT.
GET    /api/v1/projects/{projectId}/tasks/{taskId}/activity          → List all activity (comments, status changes, sprint changes). Paginated. Permission: PARTICIPANT.

### Dashboard & KPIs

GET    /api/v1/projects/{projectId}/dashboard/sprint-summary        → Active sprint summary: tasks by status, SP committed vs completed, % completion, blocked count. Permission: PARTICIPANT.
GET    /api/v1/projects/{projectId}/dashboard/velocity              → Velocity trend: SP completed per sprint for last N closed sprints. Query: ?sprints=5. Permission: PARTICIPANT.
GET    /api/v1/projects/{projectId}/dashboard/burndown              → Burndown of active sprint: current SP completed vs ideal line based on elapsed time. Permission: PARTICIPANT.
GET    /api/v1/projects/{projectId}/dashboard/workload              → Workload per member: tasks assigned per person, grouped by status. Permission: PARTICIPANT.
GET    /api/v1/projects/{projectId}/dashboard/backlog               → Backlog summary: total tasks, total SP, distribution by priority. Permission: PARTICIPANT.

### User

GET    /api/v1/users/me                    → My profile. Permission: ANY.
PUT    /api/v1/users/me                    → Edit my profile. Body: { full_name, email }. Permission: ANY.

## Response Shapes

### Success (single resource)
{ id, field1, field2, ..., created_at }

### Success (paginated list)
{ content: [...], page: 0, size: 20, totalElements: 57, totalPages: 3 }

### Error
{ error: "SPRINT_ALREADY_ACTIVE", message: "Project already has an active sprint", status: 409 }

## DTO Guidelines

- Request DTOs: only writable fields. Never include id, created_at, or computed fields.
- Response DTOs: include id, all relevant fields, created_at. For FKs, include both the ID and a summary object (e.g., assigned_to: { id, full_name, email }).
- Nested resources in responses: include parent context. Task response includes project_id and sprint summary.
- Validation: @NotBlank on required strings, @NotNull on required fields, @Size for length limits matching DB constraints.