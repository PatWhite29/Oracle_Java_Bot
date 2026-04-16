# Architecture Skill

Use this skill when working with project structure, Spring Boot configuration, security setup, service layer logic, or any structural/architectural code decisions.

## Architectural Style

Monolithic Spring Boot application. Single deployable artifact. Single Docker container on OCI.
Combination of Client-Server (macro) and Layered (internal) patterns.

## Layer Responsibilities

### Security Filter (cross-cutting)
- Intercepts every request before it reaches the Controller.
- Validates JWT and extracts user identity.
- Public endpoints excluded from filter: /api/v1/auth/register, /api/v1/auth/login.
- JWT contains user ID only — no role. Role resolution happens per-request in the service layer.

### Controller Layer
- HTTP request/response mapping only.
- Bean Validation on incoming request DTOs (@Valid).
- MapStruct for Entity↔DTO conversion.
- Never contains business logic.
- Never accesses Repository directly — always goes through Service.
- Returns proper HTTP status codes (201 for creation, 204 for delete, etc.).

### Service Layer
- All business logic lives here.
- Permission checks: verify caller is manager or member of the relevant project.
- Sprint rules: validate only one active sprint per project, enforce state transitions.
- Task rules: validate task belongs to same project as sprint, enforce read-only on closed sprint tasks.
- Generates Audit_Log entries for every write operation.
- Generates Task_Activity entries for status changes, comments, sprint moves.
- Triggers event-driven notifications (best-effort, failure does not roll back business operation).
- @Transactional wraps business operation + audit log in the same transaction.
- Notification dispatch happens AFTER the transaction commits (or within try-catch that does not propagate).

### Repository Layer
- Spring Data JPA interfaces only.
- Custom queries with @Query when needed (dashboard aggregations, filtered lists).
- Never called directly from Controller.

### Data Layer
- Oracle DB on OCI, private subnet.
- HikariCP connection pooling.
- JDBC via Spring Data JPA / Hibernate.

## Package Structure

com.chuva
├── config/                    → Spring Security, JWT, CORS, Swagger config
│   ├── SecurityConfig.java
│   ├── JwtAuthFilter.java
│   ├── JwtUtil.java
│   └── SwaggerConfig.java
├── auth/                      → Authentication module
│   ├── AuthController.java
│   ├── AuthService.java
│   ├── LoginRequest.java
│   ├── RegisterRequest.java
│   └── AuthResponse.java
├── user/                      → User management
│   ├── UserController.java
│   ├── UserService.java
│   ├── UserRepository.java
│   ├── User.java              → @Entity for APP_USER
│   ├── UserRequest.java
│   └── UserResponse.java
├── project/                   → Project management
│   ├── ProjectController.java
│   ├── ProjectService.java
│   ├── ProjectRepository.java
│   ├── Project.java
│   ├── ProjectRequest.java
│   ├── ProjectResponse.java
│   ├── member/
│   │   ├── ProjectMemberController.java
│   │   ├── ProjectMemberService.java
│   │   ├── ProjectMemberRepository.java
│   │   ├── ProjectMember.java
│   │   └── ProjectMemberResponse.java
│   └── dashboard/
│       ├── DashboardController.java
│       ├── DashboardService.java
│       ├── SprintSummaryResponse.java
│       ├── VelocityResponse.java
│       ├── BurndownResponse.java
│       ├── WorkloadResponse.java
│       └── BacklogResponse.java
├── sprint/                    → Sprint management
│   ├── SprintController.java
│   ├── SprintService.java
│   ├── SprintRepository.java
│   ├── Sprint.java
│   ├── SprintRequest.java
│   └── SprintResponse.java
├── task/                      → Task management
│   ├── TaskController.java
│   ├── TaskService.java
│   ├── TaskRepository.java
│   ├── Task.java
│   ├── TaskRequest.java
│   ├── TaskResponse.java
│   └── activity/
│       ├── TaskActivityController.java
│       ├── TaskActivityService.java
│       ├── TaskActivityRepository.java
│       ├── TaskActivity.java
│       ├── CommentRequest.java
│       └── TaskActivityResponse.java
├── audit/                     → Audit logging (cross-cutting)
│   ├── AuditLogService.java
│   ├── AuditLogRepository.java
│   └── AuditLog.java
├── notification/              → Notification system
│   ├── NotificationService.java
│   ├── NotificationScheduler.java  → @Scheduled cron for sprint deadlines
│   ├── NotificationLogRepository.java
│   └── NotificationLog.java
├── telegram/                  → Telegram Bot module
│   ├── TelegramBotConfig.java      → Conditional on TELEGRAM_BOT_TOKEN
│   ├── ChuvaBot.java               → Main bot class, command routing
│   └── handler/
│       ├── StartHandler.java
│       ├── LoginHandler.java
│       ├── HelpHandler.java
│       ├── MyProjectsHandler.java
│       ├── MyTasksHandler.java
│       ├── TaskHandler.java
│       ├── TaskStatusHandler.java
│       └── CommentHandler.java
└── common/                    → Shared utilities
    ├── exception/
    │   ├── GlobalExceptionHandler.java  → @ControllerAdvice
    │   ├── ResourceNotFoundException.java
    │   ├── ForbiddenException.java
    │   ├── ConflictException.java
    │   └── ErrorResponse.java          → { error, message, status }
    └── enums/
        ├── ProjectStatus.java          → ACTIVE, PAUSED, CLOSED
        ├── SprintStatus.java           → PLANNING, ACTIVE, CLOSED
        ├── TaskStatus.java             → TODO, IN_PROGRESS, BLOCKED, DONE
        ├── TaskPriority.java           → LOW, MEDIUM, HIGH
        ├── ActivityType.java           → COMMENT, STATUS_CHANGE, SPRINT_CHANGE
        ├── EntityType.java             → PROJECT, TASK, SPRINT, PROJECT_MEMBER
        └── AuditAction.java            → CREATE, UPDATE, DELETE

## Spring Security + JWT

- BCrypt for password hashing.
- JWT signed with a secret from environment variable (JWT_SECRET).
- JWT payload: { sub: userId, iat, exp }. No role in token.
- Token expiration: configurable via environment variable (JWT_EXPIRATION_MS).
- JwtAuthFilter extracts token from Authorization: Bearer header, validates, sets SecurityContext.
- No refresh token for current scope. If token expires, user re-authenticates.

## MapStruct

- One @Mapper interface per module (e.g., ProjectMapper, TaskMapper).
- componentModel = "spring" for DI.
- Entity → Response DTO mapping.
- Request DTO → Entity mapping (for creation).
- Never map sensitive fields (password_hash, is_active) into response DTOs.
- FK references: map entity to nested summary object (e.g., User entity → { id, full_name, email } in response).

## Bean Validation

- Applied on Request DTOs only, never on entities.
- @NotBlank for required strings.
- @NotNull for required non-string fields.
- @Size matching DB VARCHAR2 limits (e.g., @Size(max = 100) for project_name).
- @Email on email fields.
- Custom validation for enums if needed (status, priority values).

## @Transactional Boundaries

- Service methods that perform writes are @Transactional.
- Audit_Log write is inside the same transaction as the business operation.
- Task_Activity write is inside the same transaction.
- Notification dispatch is outside the transaction or in a try-catch that swallows failures.
- Read-only methods: @Transactional(readOnly = true) for query optimization.

## Error Handling

- @ControllerAdvice with GlobalExceptionHandler.
- Custom exceptions: ResourceNotFoundException (404), ForbiddenException (403), ConflictException (409).
- Spring's MethodArgumentNotValidException caught for 400 validation errors.
- All errors return ErrorResponse: { error: "ERROR_CODE", message: "Human readable message", status: 400 }.

## Environment Variables

- DB_URL, DB_USERNAME, DB_PASSWORD → Oracle DB connection.
- JWT_SECRET → JWT signing key.
- JWT_EXPIRATION_MS → Token lifetime.
- TELEGRAM_BOT_TOKEN → Telegram bot token (optional, bot module loads only if present).
- TELEGRAM_BOT_USERNAME → Bot username for BotFather.

## Build & Dependencies

- Maven as build tool.
- Key dependencies: spring-boot-starter-web, spring-boot-starter-data-jpa, spring-boot-starter-security, ojdbc11 (Oracle driver), jjwt (JWT library), mapstruct + mapstruct-processor, springdoc-openapi (Swagger), telegrambots-spring-boot-starter.
- Docker: single Dockerfile, multi-stage build (Maven build → JRE runtime).

## Code Generation Rules

- Always follow the package structure above. Do not create classes in wrong packages.
- Controllers are thin — delegate everything to the service.
- Services contain all logic — permission checks, validation, audit, activity, notification.
- One service can call another service (e.g., TaskService calls AuditLogService and NotificationService).
- Services never call controllers. Repositories never call services.
- Enums live in common/enums and are shared across modules.
- Exceptions live in common/exception.
- Every new endpoint needs: Controller method, Service method, Request DTO (if write), Response DTO, MapStruct mapping, Bean Validation on request.