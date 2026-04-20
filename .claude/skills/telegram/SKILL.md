# Telegram Bot Skill — Context & Integration Guide

## Objetivo

Completar la integración del módulo Telegram dentro del monolito Spring Boot del proyecto
Chuva Bot (Task Management System). El bot ya tiene infraestructura funcional; lo que falta
es implementar la lógica de negocio de cada handler y conectar el envío real de mensajes
en NotificationService.

---

## Contexto del repositorio

Repo: PatWhite29/Oracle_Java_Bot
Ruta base relevante: MtdrSpring/backend/src/main/java/com/springboot/MyTodoList/telegram/

El bot Telegram NO es un servicio separado — es un módulo dentro del monolito Spring Boot.
Comparte el mismo proceso, el mismo service layer, y el mismo connection pool que el REST API.

---

## Estado actual de la integración

| Componente | Estado |
|---|---|
| Dependencias Maven (telegrambots 9.1.0) | ✅ Funcional |
| Activación condicional (@ConditionalOnExpression) | ✅ Funcional |
| ChuvaBot.java — long polling + TelegramClient | ✅ Funcional |
| Enrutamiento de comandos en ChuvaBot.consume() | 🔲 TODO |
| 8 handlers creados como stubs | 🔲 TODO (lógica de negocio) |
| NotificationService — envío real de mensajes | 🔲 TODO |

---


---

## Comandos definidos (8 total)

| Handler | Comando | Descripción |
|---|---|---|
| StartHandler | /start | Bienvenida + lista de comandos disponibles |
| LoginHandler | /login {email} {password} | Autentica y vincula telegramChatId a app_user |
| HelpHandler | /help | Lista todos los comandos con descripción |
| MyProjectsHandler | /my_projects | Lista proyectos donde el usuario es manager o miembro |
| MyTasksHandler | /my_tasks | Lista tareas asignadas al usuario |
| TaskHandler | /task {id} | Detalle de una tarea (estado, prioridad, asignado, deadline) |
| TaskStatusHandler | /task_status {id} {status} | Cambia estado de una tarea vía TaskService.changeStatus |
| CommentHandler | /comment {id} {text} | Agrega comentario vía TaskActivityService.addComment |

---

## Modelo de identidad Telegram

El campo telegram_chat_id en app_user es la clave de vinculación:

- Nullable — usuarios pueden existir sin vincular Telegram
- Unique — cada chat de Telegram apunta a un solo usuario
- El comando /login es el mecanismo de vinculación en la fase actual
- En versión futura se reemplaza por un linking token generado desde el portal

Flujo de resolución de identidad en cada comando:
1. Extraer chatId del Update de Telegram
2. Buscar app_user donde telegram_chat_id = chatId
3. Si no existe → responder con mensaje de error pidiendo /login
4. Si existe → proceder con el servicio de dominio correspondiente

---

## Patrón de extensión para implementar handlers

Cada handler sigue este patrón:

1. Inyectar el servicio de dominio correspondiente (TaskService, ProjectService, etc.)
2. Inyectar UserRepository para resolver identidad por telegramChatId
3. Extraer chatId del Update → buscar usuario → si no existe responder error
4. Parsear argumentos del texto del mensaje
5. Llamar al servicio de dominio
6. Construir SendMessage y ejecutar con TelegramClient

El TelegramClient ya está instanciado en ChuvaBot. Los handlers deben recibirlo como
parámetro en el método handle(Update update, TelegramClient telegramClient) o bien
inyectarlo como bean compartido desde TelegramBotConfig.

---

## Notificaciones

### Módulo: notification/

NotificationService — registra en notification_log:
- Canal siempre TELEGRAM
- delivery_status: SENT / FAILED
- El envío real del mensaje está marcado como TODO
- Requiere inyectar TelegramClient como bean opcional desde TelegramBotConfig

NotificationScheduler — dos cron jobs (09:00 diario):
1. notifyApproachingSprintDeadlines() — sprints ACTIVE a ≤3 días de end_date
   → notifica manager + miembros con tareas no-DONE
2. retryFailedNotifications() — reintenta registros con delivery_status = FAILED

Eventos que disparan notificaciones desde TaskService:
- TASK_BLOCKED → notifica al manager del proyecto
- TASK_STATUS_CHANGE → notifica al usuario asignado

### Estrategia para conectar TelegramClient en NotificationService

Exponer TelegramClient como @Bean en TelegramBotConfig.java e inyectarlo en
NotificationService usando @Autowired(required = false) o @ConditionalOnBean.
Si el bot no está activo, el servicio registra FAILED sin intentar enviar.

---

## Variables de entorno relevantes

| Variable | Descripción |
|---|---|
| TELEGRAM_BOT_TOKEN | Token del bot (vacío = bot no arranca) |
| TELEGRAM_BOT_USERNAME | Username del bot en Telegram |

---

## Base de datos relacionada

| Tabla | Uso en Telegram |
|---|---|
| app_user | Identidad; campo telegram_chat_id nullable/unique |
| task | Consulta y actualización de tareas vía comandos |
| task_activity | Comentarios y cambios de estado generados por el bot |
| audit_log | Cambios vía bot se auditan igual que desde el REST API |
| notification_log | Registro de cada intento de notificación (SENT/FAILED) |
| project | Consulta de proyectos vía /my_projects |
| project_member | Determina qué proyectos ve cada usuario |

---

## Lo que NO se implementa en esta fase

- Linking token para autenticación sin credenciales (mejora futura documentada en Notion)
- Canal de notificación alternativo a Telegram
- Webhook (se usa long polling en todas las fases)
