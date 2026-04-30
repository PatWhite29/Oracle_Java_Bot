# MCP Server — Diseño e Integración

## Contexto

Esta documentación describe la idea de integrar un **MCP Server (Model Context Protocol)** al sistema Chuva Bot para permitir que modelos de IA externos (como Claude) operen sobre el sistema de gestión de tareas de forma estructurada y autenticada.

MCP es un protocolo abierto de Anthropic que expone **tools**, **resources** y **prompts** a cualquier cliente compatible (Claude Desktop, claude.ai, o clientes propios via API). El servidor MCP actúa como capa de integración entre el modelo de IA y el backend de Spring Boot existente.

---

## Motivación

Dos necesidades concretas justifican esta integración:

1. **Asistente IA embebido en el portal web** — Un chat dentro del portal React que pueda realizar operaciones internas (crear tareas, cerrar sprints, consultar métricas) en el contexto de la sesión del usuario autenticado.

2. **Integración con clientes MCP externos** — Permitir que herramientas como Claude Desktop gestionen tareas, proyectos y sprints directamente, sin abrir el portal web.

El MCP Server resuelve ambos casos de forma parcial o completa dependiendo del cliente, usando el mismo conjunto de tools como base.

---

## Arquitectura propuesta

```
┌─────────────────────┐     ┌──────────────────────┐
│   Claude Desktop    │     │    Portal React       │
│   (cliente externo) │     │ (asistente embebido)  │
└────────┬────────────┘     └──────────┬────────────┘
         │ MCP Protocol                │ HTTP + JWT
         ▼                             ▼
┌─────────────────────────────────────────────────────┐
│                  MCP Server                         │
│  (Java — módulo dentro del monolito Spring Boot)    │
│                                                     │
│  Tools: task_create, sprint_close, project_list...  │
│  Resources: project_docs, sprint_context...         │
│  Auth: valida PAT o JWT según cliente               │
└─────────────────────────┬───────────────────────────┘
                          │ Service layer calls
                          ▼
┌─────────────────────────────────────────────────────┐
│           Spring Boot — Capa de Servicios           │
│     (misma lógica de negocio, mismos permisos)      │
└─────────────────────────┬───────────────────────────┘
                          │
                          ▼
                    Oracle Database
```

El MCP Server **no es un servicio separado** — vive dentro del monolito Spring Boot, igual que el bot de Telegram. Reutiliza los servicios y repositorios existentes sin duplicar lógica.

---

## Tools a exponer

Cada tool del MCP server es un wrapper sobre la capa de servicios existente. El modelo de IA las invoca como funciones con parámetros tipados.

### Proyectos
| Tool | Descripción |
|---|---|
| `project_list` | Lista proyectos donde el usuario es manager o miembro |
| `project_get` | Detalle de un proyecto específico |
| `project_create` | Crea un proyecto (usuario queda como manager) |
| `project_close` | Cierra un proyecto con confirmación previa |

### Sprints
| Tool | Descripción |
|---|---|
| `sprint_list` | Lista sprints de un proyecto |
| `sprint_get` | Detalle de un sprint |
| `sprint_create` | Crea un sprint en estado PLANNING |
| `sprint_activate` | Cambia sprint a ACTIVE |
| `sprint_close` | Cierra sprint y mueve tareas pendientes |

### Tareas
| Tool | Descripción |
|---|---|
| `task_list` | Lista tareas (filtrable por proyecto, sprint, estado, asignado) |
| `task_get` | Detalle de una tarea |
| `task_create` | Crea una tarea (con o sin sprint = backlog) |
| `task_update` | Actualiza campos de una tarea |
| `task_status_change` | Cambia estado (requiere `actual_hours` si destino es DONE) |
| `task_assign` | Asigna tarea a un usuario |
| `task_comment` | Agrega comentario a una tarea |

### Contexto del usuario
| Tool | Descripción |
|---|---|
| `my_profile` | Información del usuario autenticado |
| `my_tasks` | Tareas asignadas al usuario en todos sus proyectos |
| `my_active_sprints` | Sprints activos en proyectos del usuario |

---

## Resources a exponer

Los resources son datos que el modelo puede leer para tener contexto antes de operar. A diferencia de las tools, son solo lectura.

| Resource | URI | Contenido |
|---|---|---|
| Documentación del proyecto | `project://{id}/docs` | Descripción, goal, miembros |
| Sprint activo | `project://{id}/active-sprint` | Sprint + tareas actuales |
| Backlog | `project://{id}/backlog` | Tareas sin sprint asignado |
| KPIs del sprint | `sprint://{id}/kpis` | Story points completados, horas reales vs estimadas |

---

## Autenticación

### El problema

El backend actual usa **JWT de corta vida** (validez típica: 1–2 horas). Un cliente MCP externo como Claude Desktop necesita credenciales persistentes que funcionen por días o semanas sin intervención del usuario.

### Estrategia recomendada: Personal Access Token (PAT)

El enfoque más robusto y profesional es implementar **Personal Access Tokens** — tokens de larga vida generados por el usuario desde el portal web.

**Flujo:**
```
Usuario → Portal web → "Tokens de API" → Genera PAT
→ Copia el token (se muestra una sola vez)
→ Lo configura en Claude Desktop como variable de entorno
→ MCP Server valida el PAT en cada request → identifica al usuario → aplica permisos normales
```

**Cambios requeridos en base de datos:**

```sql
ALTER TABLE APP_USER ADD (
    api_token_hash    VARCHAR2(64),      -- SHA-256 del token, nunca el token en claro
    api_token_prefix  VARCHAR2(10),      -- ej: "mcp_a3b2c1" para mostrar en UI
    api_token_created_at  TIMESTAMP,
    api_token_last_used_at TIMESTAMP     -- útil para detectar tokens inactivos
);
```

El token visible para el usuario tiene el formato `mcp_{random_32_chars}`. Solo el hash SHA-256 se persiste en DB.

**Validación en el MCP Server:**
```java
String hash = DigestUtils.sha256Hex(bearerToken);
AppUser user = userRepo.findByApiTokenHash(hash)
    .orElseThrow(UnauthorizedException::new);
// A partir de aquí: mismos permisos por proyecto que el resto del sistema
```

**Por qué no las alternativas:**

| Opción | Problema |
|---|---|
| JWT directo | Expira en horas — mala UX para clientes externos |
| JWT de larga vida (sin DB) | No revocable, riesgo de seguridad inaceptable en producción |
| OAuth 2.0 | Mejor UX pero requiere más tablas y mayor esfuerzo de implementación |

OAuth 2.0 sigue siendo una evolución válida a futuro, especialmente si se quiere soportar múltiples clientes de terceros. Para el primer release, PAT es el balance correcto entre robustez y esfuerzo.

### Autenticación para el asistente embebido (portal React)

Para el caso del asistente interno en el portal web, **no se requiere PAT**. El JWT de la sesión activa del usuario se inyecta directamente desde el backend al invocar las tools del MCP:

```
React → (JWT en header) → Endpoint de IA en Spring Boot → MCP tools (JWT ya validado)
```

---

## Consideraciones de implementación

- El MCP Server se implementa como un módulo adicional dentro de `MtdrSpring/backend`, igual que el bot de Telegram.
- Reutiliza la capa de servicios (`TaskService`, `SprintService`, etc.) sin acceder directamente a repositorios.
- Los permisos por proyecto se resuelven igual que en el resto del sistema — el MCP no introduce un modelo de permisos propio.
- Toda operación escrita genera `AUDIT_LOG` y `TASK_ACTIVITY` igual que si viniera del portal web o del bot de Telegram.
- Las notificaciones de estado siguen el mismo flujo event-driven existente.

---

## Estado actual

- [ ] Diseño inicial — **completado (este documento)**
- [ ] Implementar PAT en `APP_USER` (requiere migración de schema)
- [ ] Implementar endpoint de generación/revocación de PAT en el portal
- [ ] Implementar MCP Server con tools básicas (task_list, task_create, task_status_change)
- [ ] Implementar resources de contexto
- [ ] Integrar autenticación PAT en el MCP Server
- [ ] Probar con Claude Desktop
- [ ] Implementar asistente embebido en portal React (usa JWT de sesión)
