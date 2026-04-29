# Testing

Documentación de la infraestructura de pruebas del proyecto: qué se prueba, cómo está organizado, y cómo ejecutarlo localmente y en CI.

---

## Filosofía general

El proyecto usa **pruebas unitarias puras con Mockito** para el backend. No hay Spring context, no hay H2, no hay Oracle en CI. Cada test instancia el servicio directamente con dependencias mockeadas.

Esto es posible porque toda la lógica de negocio vive en la capa de Service, que usa inyección por constructor. Mockito reemplaza los repositorios y servicios dependientes con objetos que devuelven lo que el test necesita.

Oracle XE tarda 60–90 segundos en arrancar. **CI nunca depende de Oracle.** Las queries JPQL complejas se validan localmente contra el Docker de desarrollo.

---

## Estructura de archivos

```
src/test/java/com/springboot/MyTodoList/
├── TestFixtures.java                  ← builders compartidos entre todos los tests
├── config/
│   └── JwtUtilTest.java
├── sprint/
│   └── SprintServiceTest.java
├── task/
│   └── TaskServiceTest.java
├── project/
│   └── ProjectServiceTest.java
└── auth/
    └── AuthServiceTest.java

src/main/frontend/src/
├── setupTests.js                      ← configuración global de Jest
└── __tests__/
    ├── api.test.js
    └── AuthContext.test.jsx
```

---

## TestFixtures

**Archivo:** `src/test/java/com/springboot/MyTodoList/TestFixtures.java`

Clase utilitaria con builders estáticos. Todos los tests del service layer la usan para construir entidades sin repetir código.

| Método | Devuelve |
|--------|----------|
| `user(id)` | `User` activo con email `userN@test.com` |
| `project(id, manager)` | `Project` ACTIVE con el manager dado |
| `sprint(id, project, status)` | `Sprint` con fechas de hoy a +14 días |
| `task(id, project, sprint)` | `Task` en TODO con 3 story points |

---

## JwtUtilTest

**Archivo:** `src/test/java/com/springboot/MyTodoList/config/JwtUtilTest.java`

Prueba la clase `JwtUtil` directamente — sin Spring, sin mocks. Se instancia con `new JwtUtil(secret, expirationMs)`.

### Tests

**`generateAndValidate_roundtrip`**
Genera un token para el userId 42, luego verifica que `validateToken()` retorna `true` y que `extractUserId()` devuelve `"42"`. Confirma que el ciclo completo de creación y lectura funciona.

**`validateToken_withTamperedToken_returnsFalse`**
Genera un token válido y le modifica los últimos caracteres. Verifica que `validateToken()` retorna `false`. Garantiza que la firma HMAC detecta alteraciones.

**`validateToken_withExpiredToken_returnsFalse`**
Crea una instancia de `JwtUtil` con `expirationMs = -1` (expira inmediatamente). Verifica que el token generado ya es inválido. Cubre el caso de sesiones expiradas.

---

## SprintServiceTest

**Archivo:** `src/test/java/com/springboot/MyTodoList/sprint/SprintServiceTest.java`

Mocks: `SprintRepository`, `ProjectService`, `UserService`, `AuditLogService`, `SprintMapper`.

El `@BeforeEach` prepara un manager, proyecto y sprint en PLANNING, y los stub en los mocks correspondientes.

### Tests

**`createSprint_whenEndDateBeforeStartDate_throwsConflict`**
Intenta crear un sprint donde `endDate` es anterior a `startDate`. Verifica que se lanza `ConflictException` con mensaje `"end_date must be after start_date"`. Cubre la validación de fechas del método `validateDates()`.

**`createSprint_success_savesCalled`**
Crea un sprint con fechas válidas. Verifica que `sprintRepository.save()` fue llamado. Confirma que el flujo feliz persiste el sprint.

**`activateSprint_whenNoneActive_transitionsToActive`**
Activa un sprint que está en PLANNING, con `existsByProjectAndStatus(ACTIVE) = false`. Verifica que el sprint cambia su status a ACTIVE y que se llama `save()`. Cubre la transición PLANNING → ACTIVE.

**`activateSprint_whenAnotherAlreadyActive_throwsConflict`**
Intenta activar un sprint cuando ya existe uno activo en el proyecto. Verifica que se lanza `ConflictException` con `"SPRINT_ALREADY_ACTIVE"`. Cubre la regla: solo un sprint activo por proyecto a la vez.

**`activateSprint_whenNotPlanning_throwsConflict`**
Intenta activar un sprint que ya está en ACTIVE. Verifica que se lanza `ConflictException` con `"Only a PLANNING sprint can be activated"`. Cubre que no se puede activar un sprint que no está en estado PLANNING.

**`updateSprint_whenClosed_throwsForbidden`**
Intenta editar un sprint que está en CLOSED. Verifica que se lanza `ForbiddenException` con `"Cannot edit a closed sprint"`. Cubre la regla: los sprints cerrados son de solo lectura.

**`closeSprint_success_setsStatusToClosed`**
Cierra un sprint en ACTIVE. Verifica que el status cambia a CLOSED y que se llama `save()`. Cubre la transición → CLOSED.

**`closeSprint_whenAlreadyClosed_throwsConflict`**
Intenta cerrar un sprint que ya está CLOSED. Verifica que se lanza `ConflictException`. Cubre el guard contra doble cierre.

**`reopenSprint_whenNotClosed_throwsConflict`**
Intenta reabrir un sprint que está en PLANNING. Verifica que se lanza `ConflictException` con `"Only a CLOSED sprint can be reopened"`. Cubre que solo los sprints CLOSED se pueden reabrir.

---

## TaskServiceTest

**Archivo:** `src/test/java/com/springboot/MyTodoList/task/TaskServiceTest.java`

Mocks: `TaskRepository`, `TaskActivityRepository`, `SprintRepository`, `ProjectService`, `UserService`, `AuditLogService`, `NotificationService`, `TaskMapper`.

El `@BeforeEach` prepara un manager (id=1), un member (id=2), un proyecto con el manager, un sprint ACTIVE, y una tarea asignada al member.

### Tests — validación de DONE

**`changeStatus_toDONE_withoutActualHours_throws`**
Intenta marcar una tarea como DONE sin proporcionar `actualHours`. Verifica que se lanza `ValidationException` con mensaje sobre `"actual_hours"`. Cubre la regla: las horas reales son obligatorias al completar una tarea.

**`changeStatus_toDONE_withZeroHours_throws`**
Intenta marcar DONE con `actualHours = 0`. Verifica que se lanza `ValidationException`. Cubre que cero horas no es un valor válido (debe ser mayor a cero).

**`changeStatus_toDONE_withValidHours_setsActualHours`**
Marca DONE con `actualHours = 3.5`. Verifica que `task.getActualHours()` es 3.5 y que el status cambió a DONE. Cubre el flujo feliz del cierre de tarea.

### Tests — permisos de cambio de status

**`changeStatus_byManager_succeeds`**
El manager del proyecto (que NO es el asignado) cambia el status a IN_PROGRESS. Verifica que la operación completa sin excepción. Cubre la regla: el manager siempre puede cambiar el status, aunque no esté asignado.

**`changeStatus_byAssignee_succeeds`**
El asignado (que NO es manager) cambia el status a IN_PROGRESS. Verifica que la operación completa sin excepción. Cubre la regla: el usuario asignado puede cambiar el status de su propia tarea.

**`changeStatus_byUnrelatedUser_throws`**
Un usuario que no es manager ni asignado intenta cambiar el status. Verifica que se lanza `ForbiddenException`. Cubre que ningún otro usuario del sistema puede cambiar status de tareas ajenas.

### Tests — sprint cerrado

**`changeStatus_inClosedSprint_throws`**
Pone el sprint de la tarea en CLOSED e intenta cambiar el status. Verifica que se lanza `ClosedSprintException`. Cubre la regla: las tareas en sprints cerrados son de solo lectura.

### Tests — notificaciones

**`changeStatus_toBlocked_notifiesManager`**
Cambia el status de una tarea a BLOCKED. Verifica que `notificationService.send()` fue llamado con el manager como destinatario y el event type `"TASK_BLOCKED"`. Cubre el disparo de notificación cuando una tarea se bloquea.

**`changeStatus_toBlocked_notificationFailure_doesNotThrow`**
Configura `notificationService.send()` para que lance una excepción. Cambia el status a BLOCKED. Verifica que la operación de negocio completa sin propagar el error. Cubre la entrega best-effort: una notificación caída no debe rollbackear el cambio de status.

### Tests — sprint y actividad

**`changeSprint_generatesSPRINT_CHANGE_activity`**
Mueve una tarea a otro sprint. Captura el argumento pasado a `activityRepository.save()` y verifica que el tipo de actividad es `SPRINT_CHANGE`. Cubre que los movimientos entre sprints quedan registrados en el historial de actividad.

**`createTask_inSprintOfDifferentProject_throws`**
Intenta crear una tarea asignándola a un sprint que pertenece a otro proyecto. Verifica que se lanza `ForbiddenException` con `"Sprint does not belong to this project"`. Cubre la validación de integridad entre tarea y sprint.

---

## ProjectServiceTest

**Archivo:** `src/test/java/com/springboot/MyTodoList/project/ProjectServiceTest.java`

Mocks: `ProjectRepository`, `ProjectMemberRepository`, `SprintRepository`, `TaskRepository`, `TaskActivityRepository`, `UserService`, `AuditLogService`, `ProjectMapper`.

### Tests

**`requireManager_withManager_passes`**
Llama a `requireManager()` con el id del manager del proyecto. Verifica que no se lanza ninguna excepción. Confirma el camino feliz del check de permisos.

**`requireManager_withNonManager_throwsForbidden`**
Llama a `requireManager()` con un usuario extraño. Verifica que se lanza `ForbiddenException`. Cubre que solo el manager puede realizar acciones de manager.

**`requireParticipant_withManager_passes`**
El manager del proyecto llama a `requireParticipant()`. Verifica que no se lanza excepción (el manager no necesita estar en PROJECT_MEMBER). Cubre el camino rápido del check de participante.

**`requireParticipant_withStranger_throws`**
Un usuario que no es manager y no aparece en PROJECT_MEMBER llama a `requireParticipant()`. Verifica que se lanza `NotProjectParticipantException`. Cubre que los usuarios ajenos al proyecto no pueden ver su contenido.

**`closeProject_autoclosesPlanningAndActiveSprints`**
Cierra un proyecto que tiene un sprint PLANNING y uno ACTIVE. Verifica que ambos sprints terminan en estado CLOSED y que se llama `sprintRepository.saveAll()`. Cubre el cierre en cascada de sprints al cerrar un proyecto.

**`closeProject_returnsCorrectPendingTaskCount`**
Cierra un proyecto con dos tareas: una DONE y una IN_PROGRESS. Verifica que el `CloseProjectResponse` reporta 1 tarea pendiente. Cubre el conteo correcto de trabajo incompleto al cerrar.

---

## AuthServiceTest

**Archivo:** `src/test/java/com/springboot/MyTodoList/auth/AuthServiceTest.java`

Mocks: `UserRepository`, `PasswordEncoder`, `JwtUtil`, `UserMapper`.

### Tests

**`register_withDuplicateEmail_throws`**
Intenta registrar un usuario con un email que ya existe en la base de datos. Verifica que se lanza `ConflictException` y que `userRepository.save()` **nunca** se llama. Cubre que no se crean duplicados.

**`login_withWrongPassword_throws`**
El usuario existe pero `passwordEncoder.matches()` retorna `false`. Verifica que se lanza `BadCredentialsException`. Cubre la autenticación con contraseña incorrecta.

**`login_withInactiveUser_throws`**
El usuario existe pero tiene `isActive = false`. Verifica que se lanza `BadCredentialsException` con `"inactive"`. Cubre el soft-delete: los usuarios desactivados no pueden iniciar sesión.

**`login_success_returnsToken`**
Credenciales correctas, usuario activo. Verifica que `jwtUtil.generateToken()` fue llamado con el id del usuario y que el token está en el `AuthResponse`. Cubre el flujo feliz del login.

---

## Frontend — api.test.js

**Archivo:** `src/main/frontend/src/__tests__/api.test.js`

Mockea `global.fetch` directamente. Cada test configura la respuesta que simulará el servidor.

### Tests

**`401 response clears localStorage and redirects to /login`**
Guarda un token en localStorage, luego hace una petición que devuelve 401. Verifica que el token y el user se eliminaron de localStorage y que `window.location.href` es `'/login'`. Cubre el flujo de sesión expirada.

**`non-OK response throws ApiError with correct status`**
Devuelve una respuesta 404 con `{ message: 'Not found' }`. Verifica que `apiFetch` lanza un `ApiError` con `status = 404` y el mensaje correcto. Cubre el manejo genérico de errores HTTP.

**`204 response returns null`**
Devuelve una respuesta 204 (sin cuerpo). Verifica que `apiFetch` retorna `null`. Cubre el DELETE y otros endpoints que no retornan cuerpo.

**`ok response returns parsed JSON`**
Devuelve una respuesta 200 con un objeto JSON. Verifica que `apiFetch` retorna el objeto parseado. Cubre el camino feliz de toda petición GET/PUT/POST.

**`JWT in localStorage is included as Authorization header`**
Guarda un token en localStorage antes de la petición. Verifica que el header `Authorization: Bearer <token>` fue incluido en el fetch. Cubre la autenticación automática de todas las peticiones.

---

## Frontend — AuthContext.test.jsx

**Archivo:** `src/main/frontend/src/__tests__/AuthContext.test.jsx`

Mockea el módulo `authService`. Renderiza un componente consumidor que expone `token`, `user`, y botones para `login` y `logout`.

### Tests

**`login saves token and user to localStorage and updates state`**
Simula un click en "Login" con `authService.login` mockeado para retornar `{ token, user }`. Verifica que el token aparece en el DOM, en localStorage, y que el email del usuario es correcto. Cubre el flujo completo de inicio de sesión.

**`logout clears localStorage and resets state`**
Precarga localStorage con un token y usuario. Simula un click en "Logout". Verifica que el estado del contexto queda vacío y localStorage está limpio. Cubre el flujo de cierre de sesión.

**`initial state is loaded from localStorage on mount`**
Precarga localStorage con datos de sesión. Monta el componente. Verifica que el token y el email están presentes en el DOM desde el primer render. Cubre la persistencia de sesión al recargar la página.

---

## GitHub Actions CI

**Archivo:** `.github/workflows/ci.yml`

El workflow corre en cada push y PR a `main`, `master`, y `alternative`.

### Jobs

**`backend-test`**
- Descarga Java 17 (Temurin) con caché de Maven automático.
- Corre `mvn test -DskipFrontend=true` — no descarga Node, no toca Oracle.
- Pasa `JWT_SECRET` como variable de entorno (requerida por `application.yml`).
- Sube los reportes Surefire como artifact, siempre (incluso si falla).

**`frontend-test`**
- Descarga Node 20 con caché de `node_modules`.
- Corre `npm ci` y luego `npm test` (`--watchAll=false` está en el script).
- Corre en paralelo con `backend-test`.

**`docker-build`**
- Solo corre en push a `main`/`master` (no en PRs).
- Solo corre si `backend-test` y `frontend-test` pasan.
- Hace `docker build` completo para verificar que la imagen compila. No hace push al registry.

### Cómo funciona `skipFrontend`

El `pom.xml` tiene una propiedad `<skipFrontend>false</skipFrontend>` y el `frontend-maven-plugin` tiene `<skip>${skipFrontend}</skip>`. Al pasar `-DskipFrontend=true` en CI, Maven omite la descarga de Node y el build de React. El job de frontend los maneja por separado.

---

## Cómo ejecutar localmente

### Backend

```bash
cd MtdrSpring/backend
JWT_SECRET=test_secret_key_minimum_32_characters_long_hmac \
  mvn test -DskipFrontend=true --no-transfer-progress
```

Resultado esperado: `BUILD SUCCESS`, ~33 tests, 0 failures.

### Frontend

```bash
cd MtdrSpring/backend/src/main/frontend
npm test
```

Resultado esperado: 3 suites, 8 tests, todos en verde.

---

## Qué NO se prueba (por diseño)

| Qué | Por qué |
|-----|---------|
| MapStruct mappers | Se generan en compile-time. Si no compilan, el build falla antes de los tests. |
| Queries JPQL de repositorios | Requieren Oracle real. Se validan localmente con Docker. |
| Comandos del bot de Telegram | Dependen de `TelegramClient`. Bajo ROI en tests unitarios. |
| Queries de Dashboard | SQL específico de Oracle con agregaciones. Validar solo local. |
| Componentes de charts (Recharts) | Renderizan SVG complejo. Bajo ROI y alto costo de mantenimiento. |
