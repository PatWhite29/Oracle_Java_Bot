# Plan: Testing Infrastructure — Chuva Bot

## Context

The project has zero tests and no CI. The Spring Boot monolith's layered architecture (Controller → Service → Repository) makes the service layer fully testable with pure Mockito — no database, no Spring context, no slow startup. All business rules (status transitions, permission checks, sprint lifecycle) live in the services, so that's where the ROI is highest.

Oracle XE takes 60–90s to start. CI **must never depend on Oracle**. Every test here uses `@ExtendWith(MockitoExtension.class)` — no `@SpringBootTest`, no H2, no datasource configuration needed.

`spring-boot-starter-test` (JUnit 5, Mockito, AssertJ) is already in `pom.xml`. Nothing else needs to be added for the backend.

---

## Dependency Graph

```
pom.xml (add skipFrontend flag)
    └── enables CI backend job to run mvn test without Node.js

TestFixtures.java
    ├── SprintServiceTest.java
    ├── TaskServiceTest.java
    ├── ProjectServiceTest.java
    └── AuthServiceTest.java (doesn't use fixtures)

JwtUtilTest.java  ← standalone, no fixtures needed

package.json (add test script)
    └── setupTests.js
        ├── api.test.js
        └── AuthContext.test.jsx

ci.yml
    ├── job: backend-test  → mvn test -DskipFrontend=true
    ├── job: frontend-test → npm ci && npm test
    └── job: docker-build  → only on push to main, needs both above
```

---

## Files to Create / Modify

### 1. `MtdrSpring/backend/pom.xml` — add frontend skip flag

Add `<skip>${skipFrontend}</skip>` to the `frontend-maven-plugin` global `<configuration>`. This lets CI skip the Node.js build during backend-only test runs.

```xml
<plugin>
  <groupId>com.github.eirslett</groupId>
  <artifactId>frontend-maven-plugin</artifactId>
  <version>1.9.1</version>
  <configuration>
    <nodeVersion>${node.version}</nodeVersion>
    <npmVersion>${npm.version}</npmVersion>
    <workingDirectory>${frontend-src-dir}</workingDirectory>
    <installDirectory>${project.build.directory}</installDirectory>
    <skip>${skipFrontend}</skip>        <!-- ADD THIS LINE -->
  </configuration>
  ...
</plugin>
```

### 2. `MtdrSpring/backend/src/test/java/com/springboot/MyTodoList/TestFixtures.java`

Static factory methods for entity builders. Keeps test setup DRY across four test classes.

```java
package com.springboot.MyTodoList;

public class TestFixtures {
    public static User user(Long id) {
        return User.builder().id(id).fullName("User " + id)
                .email("user" + id + "@test.com").passwordHash("hash")
                .isActive(true).build();
    }
    public static Project project(Long id, User manager) {
        return Project.builder().id(id).projectName("Project " + id)
                .status(ProjectStatus.ACTIVE).manager(manager).build();
    }
    public static Sprint sprint(Long id, Project project, SprintStatus status) {
        return Sprint.builder().id(id).project(project).sprintName("Sprint " + id)
                .startDate(LocalDate.now()).endDate(LocalDate.now().plusDays(14))
                .status(status).build();
    }
    public static Task task(Long id, Project project, Sprint sprint) {
        return Task.builder().id(id).project(project).sprint(sprint)
                .taskName("Task " + id).status(TaskStatus.TODO).storyPoints(3)
                .createdBy(project.getManager()).build();
    }
}
```

### 3. `src/test/java/com/springboot/MyTodoList/config/JwtUtilTest.java`

Instantiate `JwtUtil` directly — no Spring, no mocks needed.

Tests (3):
- `generateAndValidate_roundtrip` — token is valid, `extractUserId` returns the userId
- `validateToken_withTamperedToken_returnsFalse` — swap last char → false
- `validateToken_withExpiredToken_returnsFalse` — `new JwtUtil(secret, -1L)` → expired immediately

```java
@ExtendWith(MockitoExtension.class)
class JwtUtilTest {
    private static final String SECRET = "test_secret_key_minimum_32_characters_long";
    private JwtUtil jwtUtil;

    @BeforeEach void setUp() { jwtUtil = new JwtUtil(SECRET, 86400000L); }
    ...
}
```

### 4. `src/test/java/com/springboot/MyTodoList/sprint/SprintServiceTest.java`

Mocks: `SprintRepository`, `ProjectService`, `UserService`, `AuditLogService`, `SprintMapper`.

Tests (9):
| Test | Asserts |
|------|---------|
| `createSprint_whenEndDateBeforeStartDate_throwsConflict` | `ConflictException` from `validateDates` |
| `createSprint_success` | `sprintRepository.save()` called, mapper called |
| `activateSprint_whenNoneActive_transitionsToActive` | `sprint.status = ACTIVE`, save called |
| `activateSprint_whenAnotherAlreadyActive_throwsConflict` | `existsByProjectAndStatus` returns true → `ConflictException` |
| `activateSprint_whenNotPlanning_throwsConflict` | Sprint is ACTIVE already → `ConflictException` |
| `updateSprint_whenClosed_throwsForbidden` | `ForbiddenException` |
| `closeSprint_success` | status becomes CLOSED, save called |
| `closeSprint_whenAlreadyClosed_throwsConflict` | `ConflictException` |
| `reopenSprint_whenNotClosed_throwsConflict` | Sprint is PLANNING → `ConflictException` |

Setup pattern:
```java
@ExtendWith(MockitoExtension.class)
class SprintServiceTest {
    @Mock SprintRepository sprintRepository;
    @Mock ProjectService projectService;
    @Mock UserService userService;
    @Mock AuditLogService auditLogService;
    @Mock SprintMapper sprintMapper;
    @InjectMocks SprintService sprintService;

    User manager; Project project; Sprint sprint;

    @BeforeEach void setUp() {
        manager = TestFixtures.user(1L);
        project = TestFixtures.project(10L, manager);
        sprint = TestFixtures.sprint(100L, project, SprintStatus.PLANNING);
        when(userService.findActiveUserById(1L)).thenReturn(manager);
        when(projectService.findProject(10L)).thenReturn(project);
        when(sprintRepository.findById(100L)).thenReturn(Optional.of(sprint));
        when(sprintMapper.toResponse(any())).thenReturn(new SprintResponse());
    }
}
```

### 5. `src/test/java/com/springboot/MyTodoList/task/TaskServiceTest.java`

Mocks: `TaskRepository`, `TaskActivityRepository`, `SprintRepository`, `ProjectService`, `UserService`, `AuditLogService`, `NotificationService`, `TaskMapper`.

Tests (11):
| Test | Key assertion |
|------|--------------|
| `changeStatus_toDONE_withoutActualHours_throws` | `ValidationException` |
| `changeStatus_toDONE_withZeroHours_throws` | `ValidationException` (zero is not > 0) |
| `changeStatus_toDONE_withValidHours_succeeds` | `task.actualHours` set, STATUS_CHANGE activity saved |
| `changeStatus_byManager_succeeds` | manager != assignee, still allowed |
| `changeStatus_byAssignee_succeeds` | non-manager assignee allowed |
| `changeStatus_byUnrelated_throws` | neither manager nor assignee → `ForbiddenException` |
| `changeStatus_inClosedSprint_throws` | sprint status CLOSED → `ClosedSprintException` |
| `changeStatus_toBlocked_notifiesManager` | `notificationService.send()` called for manager |
| `changeStatus_toBlocked_notificationFailure_doesNotThrow` | `notificationService.send()` throws, but method completes |
| `createTask_inSprintOfDifferentProject_throws` | sprint.project.id ≠ project.id → `ForbiddenException` |
| `changeSprint_generatesSPRINT_CHANGE_activity` | `activityRepository.save()` called with `SPRINT_CHANGE` type |

### 6. `src/test/java/com/springboot/MyTodoList/project/ProjectServiceTest.java`

Mocks: `ProjectRepository`, `ProjectMemberRepository`, `SprintRepository`, `TaskRepository`, `TaskActivityRepository`, `UserService`, `AuditLogService`, `ProjectMapper`.

Tests (6):
| Test | Key assertion |
|------|--------------|
| `requireManager_withNonManager_throwsForbidden` | `ForbiddenException` |
| `requireManager_withManager_passes` | no exception |
| `requireParticipant_withManager_passes` | no exception (manager path, no repo call) |
| `requireParticipant_withStranger_throws` | `findAllByParticipant` returns empty → `NotProjectParticipantException` |
| `closeProject_autoclosesPlanningAndActiveSprints` | `sprintRepository.saveAll()` called with sprints set to CLOSED |
| `closeProject_returnsCorrectCounts` | response.closedSprints and pendingTasks counts match stubs |

Note: `requireParticipant` for non-manager calls `projectRepository.findAllByParticipant(userId, Pageable.unpaged())`. Stub it to return `Page.empty()` for stranger path.

### 7. `src/test/java/com/springboot/MyTodoList/auth/AuthServiceTest.java`

Mocks: `UserRepository`, `PasswordEncoder`, `JwtUtil`, `UserMapper`.

Tests (4):
| Test | Key assertion |
|------|--------------|
| `register_withDuplicateEmail_throws` | `existsByEmail` returns true → `ConflictException` |
| `login_withWrongPassword_throws` | `passwordEncoder.matches` returns false → `BadCredentialsException` |
| `login_withInactiveUser_throws` | `user.isActive()` = false → `BadCredentialsException` |
| `login_success_returnsJwt` | `jwtUtil.generateToken()` called, token in response |

### 8. `MtdrSpring/backend/src/main/frontend/package.json` — add test script

```json
"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test --watchAll=false",
  "test:watch": "react-scripts test"
},
```

`react-scripts` 5.0.1 bundles `@testing-library/react@13`, `@testing-library/jest-dom@5`, and `@testing-library/user-event@13`. No extra packages needed.

### 9. `MtdrSpring/backend/src/main/frontend/src/setupTests.js`

```js
import '@testing-library/jest-dom';
```

CRA auto-loads this file before each test suite.

### 10. `MtdrSpring/backend/src/main/frontend/src/__tests__/api.test.js`

Mock `global.fetch` directly — no MSW needed for unit-level tests.

Tests (5):
- `401 response → clears localStorage jwt+user and redirects to /login`
- `non-OK response → throws ApiError with correct status`
- `204 response → returns null`
- `ok response → returns parsed JSON`
- `JWT in localStorage → included as Authorization: Bearer header`

```js
import { apiFetch, ApiError } from '../services/api';

beforeEach(() => {
  localStorage.clear();
  delete window.location;
  window.location = { href: '' };
});
```

### 11. `MtdrSpring/backend/src/main/frontend/src/__tests__/AuthContext.test.jsx`

Mock `authService` module. Tests (3):
- `login() → saves token+user to localStorage and updates context state`
- `logout() → clears localStorage and nulls state`
- `initial state → loads token+user from localStorage on mount`

### 12. `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push:    { branches: [master] }
  pull_request: { branches: [master] }

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { java-version: '17', distribution: 'temurin', cache: maven }
      - name: Run backend unit tests
        working-directory: MtdrSpring/backend
        env:
          JWT_SECRET: test_secret_key_minimum_32_characters_long_hmac
        run: mvn test -DskipFrontend=true --no-transfer-progress
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: surefire-reports
          path: MtdrSpring/backend/target/surefire-reports/
          retention-days: 7

  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
          cache-dependency-path: MtdrSpring/backend/src/main/frontend/package-lock.json
      - run: npm ci
        working-directory: MtdrSpring/backend/src/main/frontend
      - run: npm test
        working-directory: MtdrSpring/backend/src/main/frontend

  docker-build:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/master'
    needs: [backend-test, frontend-test]
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image (smoke check)
        working-directory: MtdrSpring
        run: docker build -f backend/Dockerfile backend/ -t chuvabot:ci-check
```

Key design choices:
- `JWT_SECRET` env var is set in CI (main `application.yml` reads `${JWT_SECRET}`). No H2, no Spring context loaded for any test.
- `-DskipFrontend=true` routes through the `<skip>${skipFrontend}</skip>` we add to the plugin — Node.js is never downloaded.
- `docker-build` is a smoke check only; it runs after both test jobs and only on pushes to main.

---

## Branch

All work goes on a dedicated branch: **`feature/testing-infrastructure`**

```bash
git checkout -b feature/testing-infrastructure
```

Open a PR against `master` when done. The CI workflow will trigger automatically on the PR.

---

## Implementation Order

1. `pom.xml` + `TestFixtures.java` + `JwtUtilTest.java` → verify `mvn test -DskipFrontend=true` passes locally
2. `SprintServiceTest.java` → confirms the most complex lifecycle logic
3. `TaskServiceTest.java` → highest business-rule density
4. `ProjectServiceTest.java` + `AuthServiceTest.java`
5. `.github/workflows/ci.yml` → CI green from first push
6. Frontend: `package.json` test script + `setupTests.js` + `api.test.js` + `AuthContext.test.jsx`

---

## What Is NOT Tested (by design)

- MapStruct mappers — compile-time generated, never fail at runtime
- Repository JPQL queries — require Oracle, validate locally only
- Telegram bot command handlers — depend on TelegramClient API, low ROI
- Dashboard aggregate queries — Oracle-specific SQL
- React chart components (Recharts SVG) — complex render, low ROI

---

## Verification

Backend:
```bash
cd MtdrSpring/backend
JWT_SECRET=test_secret_key_minimum_32_characters_long_hmac \
  mvn test -DskipFrontend=true --no-transfer-progress
# Expect: BUILD SUCCESS, ~34 tests, 0 failures, 0 errors
```

Frontend:
```bash
cd MtdrSpring/backend/src/main/frontend
npm test
# Expect: all suites pass, no --watchAll prompt
```

CI: push any commit to main or open a PR against main. GitHub Actions shows `backend-test` and `frontend-test` jobs green.
