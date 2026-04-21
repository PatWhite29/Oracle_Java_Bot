### Feature: Natural Language Interface para Telegram Bot

## Objetivo

Agregar una capa de comprensión de lenguaje natural al Telegram Bot existente. El usuario podrá escribir mensajes en lenguaje natural en lugar de comandos exactos. Los comandos siguen funcionando — el NLU es una capa adicional, no un reemplazo.

---

## Scope

Comandos incluidos en el NLU (7 de 8):

| Comando | Ejemplo en lenguaje natural |
| --- | --- |
| `/start` | "hola", "comenzar", "menú" |
| `/help` | "ayuda", "qué puedo hacer", "lista de comandos" |
| `/my_projects` | "dame mis proyectos", "en qué proyectos estoy" |
| `/my_tasks` | "dame mis tareas", "qué tengo pendiente" |
| `/task {id}` | "muéstrame la tarea 5", "detalle de tarea 3" |
| `/task_status {id} {status} [hours]` | "pon la tarea 5 en progreso", "marca la 3 como done con 2 horas" |
| `/comment {id} {text}` | "comenta en la tarea 5: revisé el código" |

**Excluido del NLU:** `/login` — maneja credenciales y no debe ser inferido desde lenguaje natural.

---

## Flujo de procesamiento

```
Mensaje entrante
       │
       ▼
¿Empieza con "/"?
   │         │
  SÍ         NO
   │         │
   ▼         ▼
Ejecutar   NaturalLanguageRouter
comando    llama a Claude API
directo         │
           ┌────┴────────────┐
           │                 │
        {status: ok}   {status: missing_params}
        comando +       comando identificado
        parámetros      pero parámetros incompletos
        completos            │
           │            Mensaje predeterminado
           ▼            específico al error
        Ejecutar             │
        handler         {status: unknown}
        normal               │
                        Mensaje genérico
                        de "no entendí"
```

---

## Componente nuevo: NaturalLanguageRouter

**Tipo:** `@Service` dentro del módulo `telegram/`

**Responsabilidad:** Recibir el texto del mensaje, llamar a la API de Claude, interpretar la respuesta JSON, y retornar un resultado tipado al `ChuvaBot`.

**Ubicación sugerida:** `telegram/nlu/NaturalLanguageRouter.java`

**Integración en ChuvaBot:** `ChuvaBot.consume()` invoca `NaturalLanguageRouter` únicamente cuando el mensaje no empieza con `/`.

---

## Contrato JSON con el LLM

El LLM responde exclusivamente con uno de estos tres formatos JSON:

**Caso 1 — Éxito, parámetros completos:**

```json
{ "status": "ok", "command": "task_status", "params": { "id": "5", "status": "IN_PROGRESS" } }
```

**Caso 2 — Comando identificado, parámetros incompletos:**

```json
{ "status": "missing_params", "command": "task_status", "missing": ["hours"] }
```

**Caso 3 — No se entendió el mensaje:**

```json
{ "status": "unknown" }
```

---

## Mensajes predeterminados de error

El `NaturalLanguageRouter` (o una clase auxiliar `NluErrorMessages`) contiene todos los mensajes de error. No se genera texto con IA — son strings fijos mapeados por `(command, missing[])`. Ejemplos:

| Comando | Parámetros faltantes | Mensaje |
| --- | --- | --- |
| `task_status` | `["hours"]` | "Para marcar una tarea como DONE debes especificar tus horas reales trabajadas. Ejemplo: marca la tarea 5 como done con 3.5 horas" |
| `task_status` | `["id"]` | "No identifiqué qué tarea quieres actualizar. Dime el ID de la tarea." |
| `task_status` | `["status"]` | "No identifiqué el nuevo estado. Los estados válidos son: TODO, IN_PROGRESS, BLOCKED, DONE." |
| `task` | `["id"]` | "No identifiqué qué tarea quieres ver. Dime el ID de la tarea." |
| `comment` | `["id"]` | "No identifiqué en qué tarea quieres comentar. Dime el ID de la tarea." |
| `comment` | `["text"]` | "No identifiqué el texto del comentario. ¿Qué quieres agregar?" |
| cualquiera | — (unknown) | "No entendí tu mensaje. Escribe /help para ver los comandos disponibles." |

---

## System prompt para Claude API

El prompt del sistema define el comportamiento del LLM. Se envía en cada llamada como `system` message.

```
You are a command classifier for a task management Telegram bot.
Your only job is to map the user's message to one of the available commands and extract parameters.
You must ALWAYS respond with valid JSON only. No explanations, no markdown, no extra text.

Available commands:
- start: greet the user or show the main menu. No params.
- help: show available commands. No params.
- my_projects: list the user's projects. No params.
- my_tasks: list the user's assigned tasks. No params.
- task: show task detail. Params: id (integer).
- task_status: update task status. Params: id (integer), status (one of: TODO, IN_PROGRESS, BLOCKED, DONE), hours (decimal, required only if status is DONE).
- comment: add a comment to a task. Params: id (integer), text (string).

Response format:
- If all required params are present: {"status": "ok", "command": "<name>", "params": { ... }}
- If the command is identified but params are missing: {"status": "missing_params", "command": "<name>", "missing": ["<param1>", ...]}
- If the message cannot be mapped to any command: {"status": "unknown"}
```

---

## Modelo y configuración de la API

| Parámetro | Valor |
| --- | --- |
| Modelo | `claude-haiku-4-5-20251001` |
| `max_tokens` | `150` |
| Variable de entorno | `ANTHROPIC_API_KEY` |
| Endpoint | `https://api.anthropic.com/v1/messages` |

El modelo Haiku es suficiente para clasificación de intenciones. El límite de 150 tokens es adecuado dado que la respuesta siempre es un JSON pequeño.

---

## Variables de entorno nuevas

| Variable | Descripción | Requerida |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | API key de la Console de Anthropic | Solo si NLU está activo |

El NLU debe activarse condicionalmente: si `ANTHROPIC_API_KEY` no está presente, `ChuvaBot` omite el paso de NLU y responde con el mensaje genérico de "no entendí" para mensajes sin `/`.

---

## Lo que NO cambia

- Las respuestas de Telegram son idénticas a las de los comandos existentes.
- Los handlers no se modifican.
- El flujo de autenticación por `telegram_chat_id` no cambia.
- `NotificationService` no se modifica.
- No se usa streaming ni herramientas (tool use) de la API — solo completion simple.

---

## Lo que queda fuera de esta fase (mejoras futuras)

- Respuestas generadas con IA (actualmente son los mismos strings de los handlers).
- Conversación multi-turno (el NLU es stateless, cada mensaje se clasifica de forma independiente).
- Soporte para `/login` en lenguaje natural.