# Database Skill

Use this skill when working with database-related code: entities, repositories, migrations, DDL, schema changes, or any data layer work.

## Schema (8 tables)

APP_USER: id, full_name, email (unique), password_hash, telegram_chat_id (nullable unique), is_active (soft delete, NUMBER(1) default 1), created_at.

PROJECT: id, project_name, description (nullable), status (ACTIVE/PAUSED/CLOSED), manager (FK APP_USER, NOT NULL, transferable), created_at. No start_date or end_date.

PROJECT_MEMBER: id, project (FK PROJECT), employee (FK APP_USER), created_at. UNIQUE(project, employee). Manager is NOT in this table.

SPRINT: id, project (FK PROJECT), sprint_name, goal (nullable), start_date, end_date (must be > start_date), status (PLANNING/ACTIVE/CLOSED), created_at.

TASK: id, project (FK PROJECT, NOT NULL), sprint (FK SPRINT, nullable — NULL = backlog), task_name, description (nullable), status (TODO/IN_PROGRESS/BLOCKED/DONE), priority (LOW/MEDIUM/HIGH, nullable), story_points (NUMBER, NOT NULL), assigned_to (FK APP_USER, nullable), created_by (FK APP_USER, NOT NULL), created_at. No due_date.

TASK_ACTIVITY: id, task (FK TASK), employee (FK APP_USER), activity_type (COMMENT/STATUS_CHANGE/SPRINT_CHANGE), content (nullable), created_at.

AUDIT_LOG: id, employee (FK APP_USER), entity_type (PROJECT/TASK/SPRINT/PROJECT_MEMBER), entity_id, action (CREATE/UPDATE/DELETE), old_value (CLOB), new_value (CLOB), created_at.

NOTIFICATION_LOG: id, recipient (FK APP_USER), event_type (SPRINT_DEADLINE/TASK_BLOCKED/TASK_STATUS_CHANGE), channel (default TELEGRAM), message (nullable), delivery_status (SENT/FAILED), sent_at.

## Data Rules

- All PKs: NUMBER GENERATED ALWAYS AS IDENTITY.
- All tables have created_at DEFAULT CURRENT_TIMESTAMP. No updated_at anywhere.
- Status/type fields use VARCHAR2 with CHECK constraints.
- Physical deletion for Projects and Tasks. Soft delete (is_active) only for APP_USER.
- old_value/new_value in AUDIT_LOG stored as JSON in CLOB.

## Permission Model (affects queries)

- No global roles. Permissions are per project.
- Manager = PROJECT.manager FK. Member = row in PROJECT_MEMBER.
- Manager is NOT stored in PROJECT_MEMBER.

## Sprint Rules (affects constraints)

- Only one ACTIVE sprint per project. Validated in service layer, not DB.
- Multiple PLANNING sprints allowed.
- Transitions: PLANNING → ACTIVE, ACTIVE → CLOSED, PLANNING → CLOSED.
- end_date > start_date enforced by CHECK constraint.

## Task Rules (affects queries and constraints)

- Task.sprint nullable — NULL means backlog.
- Task can only be assigned to a sprint of the same project. Validated in service layer.
- Tasks in CLOSED sprints are read-only except for changing sprint FK.
- No due_date on tasks. Deadlines come from sprint end_date.

## Project Lifecycle (affects cascade logic)

- Closing a project auto-closes all PLANNING and ACTIVE sprints.
- Tasks remain as-is in closed sprints for KPIs.

## JPA Entity Conventions

- Use @Entity with @Table(name = "table_name").
- PKs with @GeneratedValue(strategy = GenerationType.IDENTITY).
- Enums stored as strings: @Enumerated(EnumType.STRING).
- Nullable FKs: @ManyToOne(fetch = FetchType.LAZY) with @JoinColumn(nullable = true).
- Non-nullable FKs: @ManyToOne(fetch = FetchType.LAZY) with @JoinColumn(nullable = false).
- Default to LAZY loading on all @ManyToOne.
- Do NOT create @OneToMany bidirectional relationships unless explicitly needed.
- created_at: @Column(updatable = false) with @CreationTimestamp.

## Indexes

idx_task_sprint, idx_task_project, idx_task_assigned, idx_task_status, idx_sprint_proj_status (composite: project + status), idx_audit_entity (composite: entity_type + entity_id), idx_notif_recipient.