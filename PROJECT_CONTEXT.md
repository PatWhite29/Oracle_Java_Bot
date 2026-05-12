# PROJECT_CONTEXT — Chuva Bot

> **Infrastructure & Database:** Deployed on **OCI (Oracle Cloud Infrastructure)** using Terraform. The database is an **Oracle Autonomous Database** provisioned in OCI.

---

## Table of Contents

1. [Repository Layout](#1-repository-layout)
2. [Tech Stack](#2-tech-stack)
3. [Backend Package Structure](#3-backend-package-structure)
4. [Database Schema](#4-database-schema)
5. [Authentication & Security](#5-authentication--security)
6. [REST API Reference](#6-rest-api-reference)
7. [Business Rules & Permissions](#7-business-rules--permissions)
8. [Service Layer Details](#8-service-layer-details)
9. [Audit & Activity Tracking](#9-audit--activity-tracking)
10. [Notifications](#10-notifications)
11. [Telegram Bot — ChuvaBot](#11-telegram-bot--chuvabot)
12. [NLU Router (AI)](#12-nlu-router-ai)
13. [Dashboard & KPI Endpoints](#13-dashboard--kpi-endpoints)
14. [Error Handling](#14-error-handling)
15. [Cross-Cutting Conventions](#15-cross-cutting-conventions)

---

## 1. Repository Layout

```
Oracle_Java_Bot/
├── MtdrSpring/
│   ├── backend/                        ← Spring Boot monolith
│   │   ├── src/main/java/com/springboot/MyTodoList/
│   │   │   ├── auth/                   ← JWT register + login
│   │   │   ├── config/                 ← Security, JWT util, filters, Swagger
│   │   │   ├── common/                 ← Enums, exceptions, PagedResponse
│   │   │   ├── user/                   ← APP_USER entity, CRUD
│   │   │   ├── project/                ← PROJECT entity, lifecycle, members, dashboard
│   │   │   │   ├── member/             ← PROJECT_MEMBER junction
│   │   │   │   └── dashboard/          ← KPI services and controllers
│   │   │   ├── sprint/                 ← SPRINT entity, state machine
│   │   │   ├── task/                   ← TASK entity, status changes, sprint moves
│   │   │   │   └── activity/           ← TASK_ACTIVITY append-only log
│   │   │   ├── audit/                  ← AUDIT_LOG write-through service
│   │   │   ├── notification/           ← NOTIFICATION_LOG, scheduler, service
│   │   │   └── telegram/               ← ChuvaBot long-polling, handlers, NLU
│   │   │       ├── handler/            ← One handler class per bot command
│   │   │       └── nlu/                ← NaturalLanguageRouter (Anthropic Claude)
│   │   └── src/main/frontend/          ← React web portal
│   └── terraform/                      ← OCI infrastructure as code
└── CLAUDE.md                           ← Code generation rules
```

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 3 |
| Security | Spring Security 6 + JWT (JJWT) |
| ORM | Spring Data JPA + Hibernate |
| Mapping | MapStruct (compile-time, no reflection) |
| Validation | Jakarta Bean Validation |
| API docs | SpringDoc OpenAPI 3 / Swagger UI |
| Database | Oracle (Autonomous DB on OCI) |
| Connection pool | HikariCP |
| Telegram | TelegramBots long-polling library |
| NLU | Anthropic Claude (`claude-sonnet-4-6`) |
| Frontend | React |
| Containerisation | Docker + Docker Compose |
| Infrastructure | Terraform on OCI |

---

## 3. Backend Package Structure

Base package: `com.springboot.MyTodoList`

```
MyTodoListApplication.java       ← Entry point
auth/
  AuthController                 ← POST /api/v1/auth/register, /login
  AuthService                    ← register(), login() — BCrypt + JWT
  LoginRequest / RegisterRequest ← @Valid DTOs
  AuthResponse                   ← { token, user }
config/
  SecurityConfig                 ← Stateless session, permitAll for /auth/** and static
  JwtAuthFilter                  ← Bearer token extraction per request
  JwtUtil                        ← generateToken(userId), validateToken, extractUserId
  UserDetailsServiceImpl         ← Loads User by ID for Spring Security
  SwaggerConfig                  ← Bearer auth scheme
  RequestLoggingFilter           ← Incoming request logging
  CorsConfig                     ← CORS policy
common/
  PagedResponse<T>               ← { content, page, size, totalElements, totalPages }
  enums/
    TaskStatus     → TODO | IN_PROGRESS | BLOCKED | DONE
    TaskPriority   → LOW | MEDIUM | HIGH
    SprintStatus   → PLANNING | ACTIVE | CLOSED
    ProjectStatus  → ACTIVE | PAUSED | CLOSED
    ActivityType   → COMMENT | STATUS_CHANGE | SPRINT_CHANGE
    AuditAction    → CREATE | UPDATE | DELETE
    EntityType     → PROJECT | TASK | SPRINT | PROJECT_MEMBER
  exception/
    GlobalExceptionHandler       ← @RestControllerAdvice — all HTTP error shapes
    ResourceNotFoundException    → 404 NOT_FOUND
    ForbiddenException           → 403 FORBIDDEN
    NotProjectParticipantException → 403 FORBIDDEN
    ConflictException            → 409 CONFLICT
    ValidationException          → 400 VALIDATION_ERROR
    ClosedSprintException        → 403 CLOSED_SPRINT
    ErrorResponse                ← { error, message, status }
user/
  User                           ← @Entity APP_USER
  UserController                 ← GET /api/v1/users/me, PATCH, list
  UserService                    ← findActiveUserById(), soft-delete via isActive
  UserRepository                 ← existsByEmail, findByEmail
  UserMapper                     ← Entity ↔ UserResponse (MapStruct)
project/
  Project                        ← @Entity PROJECT
  ProjectController              ← CRUD + /close + /transfer
  ProjectService                 ← createProject, closeProject, transferProject
  ProjectRepository              ← findAllByParticipant(userId, pageable)
  ProjectMapper                  ← MapStruct
  member/
    ProjectMember                ← @Entity PROJECT_MEMBER
    ProjectMemberController      ← POST /projects/{id}/members, DELETE, GET
    ProjectMemberService         ← addMember, removeMember
  dashboard/
    DashboardController          ← /dashboard/* endpoints
    DashboardService             ← Sprint summary, velocity, efficiency, workload, backlog, burndown
sprint/
  Sprint                         ← @Entity SPRINT
  SprintController               ← CRUD + /activate + /close + /reopen
  SprintService                  ← state machine transitions, date validation
  SprintRepository               ← findByProjectAndStatus, existsByProjectAndStatus
  SprintMapper                   ← MapStruct
task/
  Task                           ← @Entity TASK
  TaskController                 ← CRUD + PATCH /status + PATCH /sprint
  TaskService                    ← createTask, changeStatus (+ actualHours), changeSprint
  TaskRepository                 ← findByProjectWithFilters (multi-filter query)
  TaskMapper                     ← MapStruct
  activity/
    TaskActivity                 ← @Entity TASK_ACTIVITY
    TaskActivityController       ← GET /tasks/{id}/activities
    TaskActivityService          ← listActivities, addComment
audit/
  AuditLog                       ← @Entity AUDIT_LOG
  AuditLogService                ← log(actor, entityType, entityId, action, old, new)
  AuditLogRepository
notification/
  NotificationLog                ← @Entity NOTIFICATION_LOG
  NotificationService            ← send(recipient, eventType, message), retryFailed()
  NotificationScheduler          ← @Scheduled cron: sprint deadline + retry failed
telegram/
  ChuvaBot                       ← @ConditionalOnExpression token present; long-polling
  TelegramBotConfig              ← Bean wiring for TelegramClient
  TelegramHelper                 ← static send(client, chatId, text)
  SyntheticUpdateFactory         ← Builds fake Update from NLU result
  handler/
    StartHandler / HelpHandler / LoginHandler
    MyProjectsHandler / MyTasksHandler
    TaskHandler / TaskStatusHandler / CommentHandler
  nlu/
    NaturalLanguageRouter        ← Calls Anthropic API, parses JSON response
    NluResult / NluStatus        ← OK | MISSING_PARAMS | UNKNOWN
    NluErrorMessages             ← User-facing error text per command
```

---

## 4. Database Schema

All PKs use `NUMBER GENERATED ALWAYS AS IDENTITY`. All tables have `created_at DEFAULT CURRENT_TIMESTAMP`. No `updated_at` — history is covered by AUDIT_LOG.

### APP_USER
| Column | Type | Notes |
|---|---|---|
| id | NUMBER PK | |
| full_name | VARCHAR2 | |
| email | VARCHAR2 UNIQUE | |
| password_hash | VARCHAR2 | BCrypt |
| telegram_chat_id | NUMBER UNIQUE | nullable; linked via /login bot command |
| is_active | NUMBER(1) | soft-delete flag |
| created_at | TIMESTAMP | |

### PROJECT
| Column | Type | Notes |
|---|---|---|
| id | NUMBER PK | |
| project_name | VARCHAR2 | |
| description | CLOB | nullable |
| status | VARCHAR2 | CHECK: ACTIVE / PAUSED / CLOSED |
| manager | NUMBER FK → APP_USER | NOT NULL; creator becomes manager |
| created_at | TIMESTAMP | |

### PROJECT_MEMBER
| Column | Type | Notes |
|---|---|---|
| id | NUMBER PK | |
| project | NUMBER FK → PROJECT | |
| employee | NUMBER FK → APP_USER | |
| created_at | TIMESTAMP | |
> UNIQUE(project, employee). Manager is **not** duplicated here.

### SPRINT
| Column | Type | Notes |
|---|---|---|
| id | NUMBER PK | |
| project | NUMBER FK → PROJECT | |
| sprint_name | VARCHAR2 | |
| goal | VARCHAR2 | nullable |
| start_date | DATE | |
| end_date | DATE | must be > start_date |
| status | VARCHAR2 | CHECK: PLANNING / ACTIVE / CLOSED |
| created_at | TIMESTAMP | |

### TASK
| Column | Type | Notes |
|---|---|---|
| id | NUMBER PK | |
| project | NUMBER FK → PROJECT | NOT NULL |
| sprint | NUMBER FK → SPRINT | nullable = backlog |
| task_name | VARCHAR2 | |
| description | CLOB | nullable |
| status | VARCHAR2 | CHECK: TODO / IN_PROGRESS / BLOCKED / DONE |
| priority | VARCHAR2 | CHECK: LOW / MEDIUM / HIGH; nullable |
| story_points | NUMBER | integer, NOT NULL |
| assigned_to | NUMBER FK → APP_USER | nullable |
| created_by | NUMBER FK → APP_USER | NOT NULL |
| actual_hours | NUMBER | decimal; required on DONE transition |
| created_at | TIMESTAMP | |

### TASK_ACTIVITY
| Column | Type | Notes |
|---|---|---|
| id | NUMBER PK | |
| task | NUMBER FK → TASK | |
| employee | NUMBER FK → APP_USER | |
| activity_type | VARCHAR2 | CHECK: COMMENT / STATUS_CHANGE / SPRINT_CHANGE |
| content | VARCHAR2 | nullable |
| created_at | TIMESTAMP | |

### AUDIT_LOG
| Column | Type | Notes |
|---|---|---|
| id | NUMBER PK | |
| employee | NUMBER FK → APP_USER | |
| entity_type | VARCHAR2 | PROJECT / TASK / SPRINT / PROJECT_MEMBER |
| entity_id | NUMBER | |
| action | VARCHAR2 | CREATE / UPDATE / DELETE |
| old_value | CLOB | JSON |
| new_value | CLOB | JSON |
| created_at | TIMESTAMP | |

### NOTIFICATION_LOG
| Column | Type | Notes |
|---|---|---|
| id | NUMBER PK | |
| recipient | NUMBER FK → APP_USER | |
| event_type | VARCHAR2 | SPRINT_DEADLINE / TASK_BLOCKED / TASK_STATUS_CHANGE |
| channel | VARCHAR2 | DEFAULT 'TELEGRAM' |
| message | VARCHAR2 | |
| delivery_status | VARCHAR2 | SENT / FAILED |
| sent_at | TIMESTAMP | |

---

## 5. Authentication & Security

### Flow
1. `POST /api/v1/auth/register` → creates `APP_USER`, returns `{ token, user }`.
2. `POST /api/v1/auth/login` → validates BCrypt hash, returns `{ token, user }`.
3. Every subsequent request carries `Authorization: Bearer <token>`.
4. `JwtAuthFilter` extracts and validates the token on every request before it reaches any controller.

### JWT
- Library: `io.jsonwebtoken` (JJWT)
- Algorithm: HMAC-SHA (key from `${jwt.secret}`)
- Subject: `userId` (Long, stored as String)
- Default expiry: 24 hours (`${jwt.expiration-ms:86400000}`)
- **No DB query per request** — validation is local.
- JWT carries only the user ID. No roles embedded.

### Stateless session
```java
// SecurityConfig.java
.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
```

### Public routes (no token required)
- `POST /api/v1/auth/**`
- `GET /swagger-ui/**`, `/v3/api-docs/**`
- Static frontend files: `/`, `/index.html`, `/static/**`, `/*.js`, `/*.css`

### Permission model
There are **no global roles**. All access decisions are per-project:
- **Manager**: `PROJECT.manager == currentUserId` — can create/update/delete sprints, tasks, members.
- **Participant**: `PROJECT.manager == currentUserId` OR row exists in `PROJECT_MEMBER`.
- Checked in service layer via `projectService.requireManager()` / `requireParticipant()`.

---

## 6. REST API Reference

All endpoints (except `/auth/**`) require `Authorization: Bearer <token>`.  
Base path: `/api/v1`

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Register new user, receive JWT |
| POST | `/auth/login` | Login, receive JWT |

### Users
| Method | Path | Description |
|---|---|---|
| GET | `/users/me` | Get current user profile |
| PATCH | `/users/me` | Update own profile |

### Projects
| Method | Path | Description |
|---|---|---|
| POST | `/projects` | Create project (caller becomes manager) |
| GET | `/projects` | List caller's projects (paginated) |
| GET | `/projects/{projectId}` | Get project by ID |
| PUT | `/projects/{projectId}` | Update project (manager only) |
| DELETE | `/projects/{projectId}` | Delete project (manager only) |
| POST | `/projects/{projectId}/close` | Close project — auto-closes all open sprints |
| POST | `/projects/{projectId}/transfer` | Transfer manager role to another member |

### Project Members
| Method | Path | Description |
|---|---|---|
| POST | `/projects/{projectId}/members` | Add member to project (manager only) |
| DELETE | `/projects/{projectId}/members/{userId}` | Remove member (manager only) |
| GET | `/projects/{projectId}/members` | List all members |

### Sprints
| Method | Path | Description |
|---|---|---|
| POST | `/projects/{projectId}/sprints` | Create sprint (PLANNING status) |
| GET | `/projects/{projectId}/sprints` | List sprints (paginated) |
| GET | `/projects/{projectId}/sprints/{sprintId}` | Get sprint by ID |
| PUT | `/projects/{projectId}/sprints/{sprintId}` | Update sprint (not CLOSED) |
| POST | `/projects/{projectId}/sprints/{sprintId}/activate` | PLANNING → ACTIVE |
| POST | `/projects/{projectId}/sprints/{sprintId}/close` | Any → CLOSED |
| POST | `/projects/{projectId}/sprints/{sprintId}/reopen` | CLOSED → PLANNING |
| DELETE | `/projects/{projectId}/sprints/{sprintId}` | Delete sprint (moves tasks to backlog) |

### Tasks
| Method | Path | Description |
|---|---|---|
| POST | `/projects/{projectId}/tasks` | Create task |
| GET | `/projects/{projectId}/tasks` | List tasks with filters: `status`, `sprint`, `assigned_to`, `priority` |
| GET | `/projects/{projectId}/tasks/{taskId}` | Get task by ID |
| PUT | `/projects/{projectId}/tasks/{taskId}` | Update task (manager only) |
| DELETE | `/projects/{projectId}/tasks/{taskId}` | Delete task (manager only) |
| PATCH | `/projects/{projectId}/tasks/{taskId}/status` | Change task status — requires `actual_hours` when transitioning to DONE |
| PATCH | `/projects/{projectId}/tasks/{taskId}/sprint` | Move task to a sprint or backlog |

### Task Activities
| Method | Path | Description |
|---|---|---|
| GET | `/projects/{projectId}/tasks/{taskId}/activities` | List activity log for a task |
| POST | `/projects/{projectId}/tasks/{taskId}/activities` | Add a comment |

### Dashboard / KPIs
| Method | Path | Description |
|---|---|---|
| GET | `/projects/{projectId}/dashboard/sprint-summary` | Task counts + SP committed/completed for a sprint |
| GET | `/projects/{projectId}/dashboard/velocity` | SP completed per closed sprint (last N) |
| GET | `/projects/{projectId}/dashboard/efficiency` | Hours + SP per member for a sprint |
| GET | `/projects/{projectId}/dashboard/workload` | Task count and SP per member per status |
| GET | `/projects/{projectId}/dashboard/backlog` | Total tasks, total SP, breakdown by priority |
| GET | `/projects/{projectId}/dashboard/burndown` | Ideal vs actual burn % for a sprint |

---

## 7. Business Rules & Permissions

### Sprint State Machine
```
PLANNING ──activate──► ACTIVE ──close──► CLOSED
PLANNING ──close───────────────────────► CLOSED
CLOSED   ──reopen──────────────────────► PLANNING
```
- Only **one ACTIVE sprint** per project at a time. `activateSprint()` throws `ConflictException` if one already exists.
- Deleting a sprint moves all its tasks to backlog (sets `sprint = NULL`). Cannot delete an ACTIVE sprint.
- CLOSED sprint tasks are **read-only** — any mutation throws `ClosedSprintException`.

### Task Rules
- `sprint = NULL` means the task is in the **backlog** of that project.
- `story_points` is **required** (integer, > 0).
- `priority` is optional (LOW / MEDIUM / HIGH).
- `assigned_to` is nullable.
- Transitioning to `DONE` **requires** `actual_hours > 0` in the request body.
- `actual_hours` is overwritten on every DONE transition. Reopening a task leaves it unchanged.
- Task's sprint must belong to the **same project** as the task (validated in service layer).

### Project Lifecycle
- Creating a project sets status `ACTIVE` and auto-creates a `PROJECT_MEMBER` row for the manager.
- `closeProject()` auto-closes all PLANNING and ACTIVE sprints, then sets project to CLOSED.
- Response body includes count of affected sprints and pending tasks.
- `transferProject()` requires the new manager to already be a `PROJECT_MEMBER`.
- Physical deletion: `deleteProject()` cascades deletes of activities → tasks → sprints → members → project.

### Permission Checks
```java
// Manager guard
public void requireManager(Long userId, Project project) {
    if (!project.getManager().getId().equals(userId))
        throw new ForbiddenException("Only the project manager can perform this action");
}

// Task status change — manager OR assignee
boolean isManager = project.getManager().getId().equals(userId);
boolean isAssigned = task.getAssignedTo() != null && task.getAssignedTo().getId().equals(userId);
if (!isManager && !isAssigned)
    throw new ForbiddenException("Only the project manager or assigned user can change task status");
```

---

## 8. Service Layer Details

### AuthService
- `register`: checks email uniqueness, BCrypt-encodes password, saves user, generates token.
- `login`: loads user by email, checks `isActive`, matches BCrypt hash, generates token.

### ProjectService
- `createProject`: saves project, immediately adds manager to `PROJECT_MEMBER`, logs audit.
- `closeProject`: closes all open sprints in one `saveAll`, collects pending tasks, sets project CLOSED, returns `CloseProjectResponse`.
- `transferProject`: validates new manager is a member before changing `PROJECT.manager`.

### SprintService
- `activateSprint`: guards against multiple ACTIVE sprints with `existsByProjectAndStatus`.
- `deleteSprint`: calls `taskRepository.detachTasksFromSprint(sprint)` to null out the FK before deleting.
- `validateDates`: `endDate > startDate`, else `ConflictException`.

### TaskService
- `createTask`: manager-only. Resolves optional sprint and assignee, builds entity, saves, logs audit.
- `changeStatus`: manager OR assigned user. On DONE: validates `actualHours > 0`, sets `task.actualHours`. Appends `STATUS_CHANGE` activity. Fires `TASK_BLOCKED` notification to manager, and `TASK_STATUS_CHANGE` to assignee (both best-effort, ignored on failure).
- `changeSprint`: manager-only. Appends `SPRINT_CHANGE` activity. Logs audit.
- `listTasks`: supports multi-filter via `findByProjectWithFilters(project, status, sprint, assignedTo, priority, pageable)`.

### DashboardService
- All methods resolve sprint via `resolveSprint(project, sprintId)`: falls back to active sprint if `sprintId` is null.
- `getVelocity`: queries closed sprints sorted by `endDate`, slices last N, sums DONE story-points.
- `getEfficiency`: pulls SP + actual hours per member for DONE tasks via a projection query.
- `getBurndown`: computes ideal burn % from elapsed days / total days; actual burn % from completedSp / totalSp.

---

## 9. Audit & Activity Tracking

### AuditLogService
Every write operation (CREATE / UPDATE / DELETE) on PROJECT, TASK, SPRINT, PROJECT_MEMBER calls:
```java
auditLogService.log(actor, EntityType.TASK, task.getId(), AuditAction.UPDATE, oldValue, newValue);
```
- `oldValue` and `newValue` are serialized to JSON (Jackson `ObjectMapper`) and stored as CLOB.
- The audit log write is part of the **same `@Transactional` as the business operation** — if it fails, the business operation rolls back.

### TaskActivity (append-only log)
Three activity types are created automatically:
- `STATUS_CHANGE` — on every `changeStatus()` call, content = `"TODO → IN_PROGRESS"`.
- `SPRINT_CHANGE` — on `changeSprint()`, content = `"Moved from sprint X to Y"` (backlog if null).
- `COMMENT` — via `TaskActivityService.addComment()`, content = free text.

---

## 10. Notifications

### NotificationService
- `send(recipient, eventType, message)`: delivers via Telegram if `telegram_chat_id` is set on the recipient, logs to `NOTIFICATION_LOG`.
- `retryFailed()`: re-sends entries where `delivery_status = FAILED`.
- Notification failures **never roll back** the business operation (caught and ignored in `TaskService`).

### NotificationScheduler
Two `@Scheduled(cron = "0 0 9 * * *")` jobs run daily at 09:00:
1. **Sprint deadline warning**: finds all ACTIVE sprints ending within 3 days, skips if all tasks are DONE, sends message to manager + each assigned member with incomplete tasks.
2. **Retry failed**: calls `notificationService.retryFailed()`.

### Event triggers
| Event | Who is notified |
|---|---|
| Task transitions to BLOCKED | Project manager |
| Task status changes | Assigned user |
| Sprint ending within 3 days | Manager + members with non-DONE tasks |

---

## 11. Telegram Bot — ChuvaBot

`ChuvaBot` implements `SpringLongPollingBot` and `LongPollingSingleThreadUpdateConsumer`.

### Activation
```java
@ConditionalOnExpression("!'${telegram.bot.token:}'.isEmpty()")
```
Bot only starts if `TELEGRAM_BOT_TOKEN` environment variable is set.

### Message routing
```
message received
  ├── starts with '/' → routeCommand(command, update)
  └── plain text      → handleNaturalLanguage(text, update, chatId)
```

### Command handlers
| Command | Handler class | Description |
|---|---|---|
| `/start` | `StartHandler` | Welcome message |
| `/login` | `LoginHandler` | Links Telegram `chat_id` to APP_USER account |
| `/help` | `HelpHandler` | Lists all available commands |
| `/my_projects` | `MyProjectsHandler` | Lists user's projects |
| `/my_tasks` | `MyTasksHandler` | Lists tasks assigned to the user |
| `/task {id}` | `TaskHandler` | Shows task detail |
| `/task_status {id} {status} [hours]` | `TaskStatusHandler` | Changes task status (hours required for DONE) |
| `/comment {id} {text}` | `CommentHandler` | Adds a comment to a task |

### Natural Language fallback
Non-command text is sent to `NaturalLanguageRouter`. If NLU returns a valid command, `SyntheticUpdateFactory` wraps the extracted params into a fake `Update` object and `routeCommand` is called transparently.

---

## 12. NLU Router (AI)

`NaturalLanguageRouter` calls **Anthropic Claude** (`claude-sonnet-4-6`) to classify free-text messages into bot commands.

### Activation
Requires `ANTHROPIC_API_KEY` environment variable. If absent, every NLU call returns `NluResult.unknown()` and the bot replies with the help hint.

### API call
- Endpoint: `https://api.anthropic.com/v1/messages`
- Max tokens: 150
- System prompt: instructs Claude to respond with JSON only, map to one of 7 commands, and extract integer IDs.

### Response states
```json
{ "status": "ok",            "command": "task_status", "params": { "id": "18", "status": "DONE", "hours": "2.5" } }
{ "status": "missing_params","command": "task_status", "missing": ["hours"] }
{ "status": "unknown" }
```

### Param validation
After a successful NLU classification, `ChuvaBot.validateNluParams()` checks that any `id` param is a pure integer. If not, a user-friendly error is sent via `NluErrorMessages`.

---

## 13. Dashboard & KPI Endpoints

All dashboard endpoints are under `/api/v1/projects/{projectId}/dashboard/` and require project participation. Sprint parameter is optional — defaults to the active sprint.

| Endpoint | Response shape | Key metric |
|---|---|---|
| `GET /sprint-summary` | `SprintSummaryResponse` | `statusCounts`, `spCommitted`, `spCompleted`, `completionPercentage`, `blockedCount` |
| `GET /velocity?sprints=N` | `List<VelocityResponse>` | SP completed per closed sprint, ordered oldest → newest |
| `GET /efficiency` | `EfficiencyResponse` | Per-member: SP completed + actual hours (DONE tasks only) |
| `GET /workload` | `List<WorkloadResponse>` | Per-member: task count and SP by status |
| `GET /backlog` | `BacklogResponse` | Total backlog tasks, total SP, count by priority |
| `GET /burndown` | `BurndownResponse` | `idealBurnPercent` (time elapsed) vs `actualBurnPercent` (SP done / total SP) |

---

## 14. Error Handling

All errors are handled by `GlobalExceptionHandler` (`@RestControllerAdvice`). Every error response follows:
```json
{ "error": "NOT_FOUND", "message": "Task not found: 42", "status": 404 }
```

| Exception class | HTTP Status | `error` code |
|---|---|---|
| `ResourceNotFoundException` | 404 | `NOT_FOUND` |
| `ForbiddenException` | 403 | `FORBIDDEN` |
| `NotProjectParticipantException` | 403 | `FORBIDDEN` |
| `ClosedSprintException` | 403 | `CLOSED_SPRINT` |
| `ConflictException` | 409 | `CONFLICT` |
| `ValidationException` | 400 | `VALIDATION_ERROR` |
| `BadCredentialsException` | 401 | `UNAUTHORIZED` |
| `MethodArgumentNotValidException` | 400 | `VALIDATION_ERROR` |
| All other `Exception` | 500 | `INTERNAL_ERROR` |

---

## 15. Cross-Cutting Conventions

- **DTOs only** at controller boundaries. Entities are never serialized directly.
- **MapStruct** for all entity ↔ DTO mapping. No manual mapping code.
- **`@Transactional`** on every service method that modifies data. Read-only methods use `@Transactional(readOnly = true)`.
- **Audit always in-transaction**: `auditLogService.log(...)` is called inside the same `@Transactional` block as the business operation.
- **Soft delete** only for `APP_USER` (via `is_active`). Projects and tasks are physically deleted.
- **Pagination** via Spring Data `Pageable` + `PagedResponse<T>` wrapper on all list endpoints.
- **Bean Validation** on all request DTOs (`@Valid` in controllers, annotations on fields).
- **No `updated_at`** on any table — change history is fully covered by `AUDIT_LOG`.
- **No global roles** — permission is always evaluated against the specific project relationship.

