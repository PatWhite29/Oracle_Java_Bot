# CLAUDE.md — Chuva Bot Task Management System

## Project Overview

Task Management System with three components: Spring Boot REST API, React web portal, and Telegram Bot (Chuva Bot). Deployed on OCI with Docker. Oracle Database backend.

Tech stack: Java + Spring Boot, React, Oracle DB, Docker, OCI, Telegram Bot API.

## Database Schema (8 tables)

APP_USER: System identity. No global role. Fields: id, full_name, email, password_hash, telegram_chat_id (nullable unique), is_active (soft delete), created_at.

PROJECT: Root work entity. Fields: id, project_name, description, status (ACTIVE/PAUSED/CLOSED), manager (FK APP_USER, NOT NULL, transferable), created_at. No start_date or end_date.

PROJECT_MEMBER: Junction table. Fields: id, project (FK PROJECT), employee (FK APP_USER), created_at. UNIQUE(project, employee). Manager is NOT in this table — only in PROJECT.manager.

SPRINT: Timebox within a project. Fields: id, project (FK PROJECT), sprint_name, goal (nullable), start_date, end_date, status (PLANNING/ACTIVE/CLOSED), created_at. end_date must be > start_date.

TASK: Unit of work. Fields: id, project (FK PROJECT, NOT NULL), sprint (FK SPRINT, nullable — NULL means backlog), task_name, description, status (TODO/IN_PROGRESS/BLOCKED/DONE), priority (LOW/MEDIUM/HIGH, nullable), story_points (integer, NOT NULL), assigned_to (FK APP_USER, nullable), created_by (FK APP_USER, NOT NULL), created_at. No due_date — deadlines come from sprint end_date.

TASK_ACTIVITY: Append-only log. Fields: id, task (FK TASK), employee (FK APP_USER), activity_type (COMMENT/STATUS_CHANGE/SPRINT_CHANGE), content (nullable), created_at.

AUDIT_LOG: Generic audit trail. Fields: id, employee (FK APP_USER), entity_type (PROJECT/TASK/SPRINT/PROJECT_MEMBER), entity_id, action (CREATE/UPDATE/DELETE), old_value (CLOB), new_value (CLOB), created_at.

NOTIFICATION_LOG: Notification tracking. Fields: id, recipient (FK APP_USER), event_type (SPRINT_DEADLINE/TASK_BLOCKED/TASK_STATUS_CHANGE), channel (default TELEGRAM), message, delivery_status (SENT/FAILED), sent_at.

## Permission Model

No global roles. Permissions are 100% per project:
- Manager of a project = PROJECT.manager FK points to you.
- Member of a project = you have a row in PROJECT_MEMBER.
- Any registered user can create a project. Creating one makes you its manager.
- JWT contains user identity only (no role). Each endpoint resolves permissions by checking user's relationship with the relevant project.

## Sprint Rules

- Only one ACTIVE sprint per project at a time.
- Multiple PLANNING sprints allowed simultaneously.
- Transitions: PLANNING → ACTIVE (if no other active), ACTIVE → CLOSED, PLANNING → CLOSED.
- Closing a sprint freezes its tasks (read-only). Only allowed write: change sprint FK (move task to another sprint or backlog).
- A task can only be assigned to a sprint of the same project. Validate in service layer.

## Project Lifecycle

- Closing a project auto-closes all PLANNING and ACTIVE sprints.
- API returns a warning before closing, showing affected sprints and pending tasks. Manager must confirm.
- Tasks remain as-is in closed sprints for KPI purposes.

## Task Rules

- Task without sprint = backlog of that project.
- No due_date on tasks. Deadlines inherited from sprint end_date.
- story_points is required (integer). priority is optional.
- assigned_to is nullable (unassigned tasks allowed).
- Physical deletion for Projects and Tasks. Soft delete (is_active) only for APP_USER.

## Architecture

- Monolithic Spring Boot application.
- Layered: Security Filter → Controller → Service → Repository → Oracle DB.
- Spring Security + JWT for authentication. JWT validated locally, no DB query per request.
- Spring Data JPA + Hibernate for ORM.
- MapStruct for Entity↔DTO mapping (compile-time, no reflection).
- Bean Validation on DTOs.
- HikariCP connection pooling.
- SpringDoc OpenAPI (Swagger) for API documentation.
- Role checks via @PreAuthorize or service-layer logic checking project membership.

## Telegram Bot

- Lives as a module inside the Spring Boot monolith, NOT a separate service.
- Uses long polling (not webhooks).
- Conditional on TELEGRAM_BOT_TOKEN environment variable being present.
- telegram_chat_id stored on APP_USER, linked via /login bot command.
- Commands: /start, /login, /help, /my_projects, /my_tasks, /task {id}, /task_status {id} {status}, /comment {id} {text}.

## Notifications

- Sprint deadline only (current scope): cron job notifies Manager + members with non-DONE tasks when sprint end_date is approaching.
- Event-driven: TASK_BLOCKED notifies project Manager, TASK_STATUS_CHANGE notifies assigned member.
- Failed notifications logged with delivery_status = FAILED, retried on next cron cycle.
- All notifications recorded in NOTIFICATION_LOG.

## Audit

- Every write operation (CREATE/UPDATE/DELETE) on PROJECT, TASK, SPRINT, PROJECT_MEMBER generates an AUDIT_LOG entry.
- Audit log and business operation execute in the same DB transaction — if audit fails, business operation rolls back.
- old_value and new_value stored as JSON in CLOB fields.

## Cross-Cutting Conventions

- All tables use NUMBER GENERATED ALWAYS AS IDENTITY for PKs.
- All tables have created_at with DEFAULT CURRENT_TIMESTAMP. No updated_at — Audit_Log covers change history.
- Status/type fields use VARCHAR2 with CHECK constraints.
- Docker with environment variables for all sensitive configuration.
- Seed SQL creates initial user and demo project.

## Code Generation Rules for Claude Code

- Follow the layered architecture strictly: Controller → Service → Repository. Controllers never access repositories directly.
- Always use DTOs for request/response. Never expose entities directly.
- Use MapStruct interfaces for mapping. Do not write manual mapping code.
- Apply Bean Validation annotations on request DTOs.
- Service methods that modify data must generate Audit_Log entries.
- Service methods that change task status must generate Task_Activity entries.
- Sprint assignment changes must generate SPRINT_CHANGE Task_Activity entries.
- Wrap business operation + audit in the same @Transactional.
- Notification failures must not roll back business operations (best-effort delivery).
- Use @PreAuthorize or explicit service-layer checks for project-level permissions.