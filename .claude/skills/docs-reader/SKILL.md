---
name: docs-reader
description: Read the relevant documentation files from documentation/ before implementing or modifying any feature, ensuring all code aligns with established architecture, schema, and API contracts.
---

## Trigger Conditions

Invoke this skill automatically (before generating any code or plan) when the user's request matches any of the following:

### API / Endpoints
Keywords: endpoint, controller, REST, HTTP, route, request, response, ruta, `/api/`, `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`, DTO, response body, status code, Swagger, OpenAPI

→ Read `documentation/api.md`

### Database / Schema
Keywords: table, schema, entity, migration, query, JPA, repository, `@Entity`, `@Column`, FK, foreign key, relation, Oracle, SQL, `@OneToMany`, `@ManyToOne`, índice, constraint, campo nuevo, nueva tabla

→ Read `documentation/database.md`

### Architecture / Structure
Keywords: layer, capas, estructura, package, patrón, service, monolith, cómo organizar, dónde poner, MapStruct, Bean Validation, HikariCP, Spring Security, JWT, nueva funcionalidad, módulo nuevo

→ Read `documentation/architecture.md`

### Frontend / React
Keywords: React, component, componente, UI, página, frontend, hook, state, prop, fetch, axios, web portal, vista, formulario, botón, tabla, CSS

→ Read `documentation/frontend.md`

### Telegram Bot
Keywords: bot, Telegram, comando, command, long polling, `/start`, `/login`, `/my_tasks`, `/my_projects`, `/task`, `telegram_chat_id`, BotHandler, TelegramBot

→ Read `documentation/telegram.md`

## Behavior Rules

1. Before generating any code, identify which domains are involved and read the corresponding documentation file(s).
2. If multiple domains are involved, read all relevant files before proceeding.
3. Base the implementation strictly on what the documentation specifies — structure, naming, patterns, and constraints.
4. If the documentation contradicts the user's request, flag the conflict and ask for clarification before proceeding.
5. Never skip this step for implementation tasks, even for "small" changes — a new field or a new route still must align with the documented contracts.

## Documentation File Map

| Domain       | File                            |
|--------------|---------------------------------|
| API          | `documentation/api.md`          |
| Database     | `documentation/database.md`     |
| Architecture | `documentation/architecture.md` |
| Frontend     | `documentation/frontend.md`     |
| Telegram     | `documentation/telegram.md`     |
