package com.springboot.MyTodoList.task;

import com.springboot.MyTodoList.TestFixtures;
import com.springboot.MyTodoList.audit.AuditLogService;
import com.springboot.MyTodoList.common.enums.ActivityType;
import com.springboot.MyTodoList.common.enums.SprintStatus;
import com.springboot.MyTodoList.common.enums.TaskStatus;
import com.springboot.MyTodoList.common.exception.ClosedSprintException;
import com.springboot.MyTodoList.common.exception.ForbiddenException;
import com.springboot.MyTodoList.common.exception.ValidationException;
import com.springboot.MyTodoList.notification.NotificationService;
import com.springboot.MyTodoList.project.Project;
import com.springboot.MyTodoList.project.ProjectService;
import com.springboot.MyTodoList.sprint.Sprint;
import com.springboot.MyTodoList.sprint.SprintRepository;
import com.springboot.MyTodoList.task.activity.TaskActivity;
import com.springboot.MyTodoList.task.activity.TaskActivityRepository;
import com.springboot.MyTodoList.user.User;
import com.springboot.MyTodoList.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock TaskRepository taskRepository;
    @Mock TaskActivityRepository activityRepository;
    @Mock SprintRepository sprintRepository;
    @Mock ProjectService projectService;
    @Mock UserService userService;
    @Mock AuditLogService auditLogService;
    @Mock NotificationService notificationService;
    @Mock TaskMapper taskMapper;
    @InjectMocks TaskService taskService;

    User manager;
    User member;
    Project project;
    Sprint activeSprint;
    Task task;

    @BeforeEach
    void setUp() {
        manager = TestFixtures.user(1L);
        member = TestFixtures.user(2L);
        project = TestFixtures.project(10L, manager);
        activeSprint = TestFixtures.sprint(100L, project, SprintStatus.ACTIVE);
        task = TestFixtures.task(200L, project, activeSprint);
        task.setAssignedTo(member);

        given(taskRepository.findById(200L)).willReturn(Optional.of(task));
        given(taskMapper.toResponse(any())).willReturn(new TaskResponse());
    }

    // --- changeStatus: DONE validation ---

    @Test
    void changeStatus_toDONE_withoutActualHours_throws() {
        given(userService.findActiveUserById(1L)).willReturn(manager);
        given(projectService.findProject(10L)).willReturn(project);

        StatusChangeRequest req = doneRequest(null);

        assertThatThrownBy(() -> taskService.changeStatus(1L, 10L, 200L, req))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("actual_hours");
    }

    @Test
    void changeStatus_toDONE_withZeroHours_throws() {
        given(userService.findActiveUserById(1L)).willReturn(manager);
        given(projectService.findProject(10L)).willReturn(project);

        StatusChangeRequest req = doneRequest(BigDecimal.ZERO);

        assertThatThrownBy(() -> taskService.changeStatus(1L, 10L, 200L, req))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("actual_hours");
    }

    @Test
    void changeStatus_toDONE_withValidHours_setsActualHours() {
        given(userService.findActiveUserById(1L)).willReturn(manager);
        given(projectService.findProject(10L)).willReturn(project);

        taskService.changeStatus(1L, 10L, 200L, doneRequest(new BigDecimal("3.5")));

        assertThat(task.getActualHours()).isEqualByComparingTo("3.5");
        assertThat(task.getStatus()).isEqualTo(TaskStatus.DONE);
    }

    // --- changeStatus: permission checks ---

    @Test
    void changeStatus_byManager_succeeds() {
        given(userService.findActiveUserById(1L)).willReturn(manager);
        given(projectService.findProject(10L)).willReturn(project);

        StatusChangeRequest req = statusRequest(TaskStatus.IN_PROGRESS);
        taskService.changeStatus(1L, 10L, 200L, req);

        assertThat(task.getStatus()).isEqualTo(TaskStatus.IN_PROGRESS);
    }

    @Test
    void changeStatus_byAssignee_succeeds() {
        given(userService.findActiveUserById(2L)).willReturn(member);
        given(projectService.findProject(10L)).willReturn(project);

        StatusChangeRequest req = statusRequest(TaskStatus.IN_PROGRESS);
        taskService.changeStatus(2L, 10L, 200L, req);

        assertThat(task.getStatus()).isEqualTo(TaskStatus.IN_PROGRESS);
    }

    @Test
    void changeStatus_byUnrelatedUser_throws() {
        User stranger = TestFixtures.user(99L);
        given(userService.findActiveUserById(99L)).willReturn(stranger);
        given(projectService.findProject(10L)).willReturn(project);

        assertThatThrownBy(() -> taskService.changeStatus(99L, 10L, 200L, statusRequest(TaskStatus.IN_PROGRESS)))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("manager or assigned user");
    }

    // --- changeStatus: closed sprint ---

    @Test
    void changeStatus_inClosedSprint_throws() {
        activeSprint.setStatus(SprintStatus.CLOSED);
        given(userService.findActiveUserById(1L)).willReturn(manager);
        given(projectService.findProject(10L)).willReturn(project);

        assertThatThrownBy(() -> taskService.changeStatus(1L, 10L, 200L, statusRequest(TaskStatus.IN_PROGRESS)))
                .isInstanceOf(ClosedSprintException.class);
    }

    // --- changeStatus: BLOCKED notification ---

    @Test
    void changeStatus_toBlocked_notifiesManager() {
        given(userService.findActiveUserById(1L)).willReturn(manager);
        given(projectService.findProject(10L)).willReturn(project);

        taskService.changeStatus(1L, 10L, 200L, statusRequest(TaskStatus.BLOCKED));

        verify(notificationService).send(eq(manager), eq("TASK_BLOCKED"), anyString());
    }

    @Test
    void changeStatus_toBlocked_notificationFailure_doesNotThrow() {
        given(userService.findActiveUserById(1L)).willReturn(manager);
        given(projectService.findProject(10L)).willReturn(project);
        willThrow(new RuntimeException("Telegram down")).given(notificationService).send(any(), any(), any());

        // should complete without throwing
        taskService.changeStatus(1L, 10L, 200L, statusRequest(TaskStatus.BLOCKED));

        assertThat(task.getStatus()).isEqualTo(TaskStatus.BLOCKED);
    }

    // --- changeSprint ---

    @Test
    void changeSprint_generatesSPRINT_CHANGE_activity() {
        given(userService.findActiveUserById(1L)).willReturn(manager);
        given(projectService.findProject(10L)).willReturn(project);

        Sprint newSprint = TestFixtures.sprint(101L, project, SprintStatus.PLANNING);
        given(sprintRepository.findById(101L)).willReturn(Optional.of(newSprint));

        SprintChangeRequest req = new SprintChangeRequest();
        req.setSprintId(101L);
        taskService.changeSprint(1L, 10L, 200L, req);

        ArgumentCaptor<TaskActivity> captor = ArgumentCaptor.forClass(TaskActivity.class);
        verify(activityRepository).save(captor.capture());
        assertThat(captor.getValue().getActivityType()).isEqualTo(ActivityType.SPRINT_CHANGE);
    }

    // --- resolveSprint: different project ---

    @Test
    void createTask_inSprintOfDifferentProject_throws() {
        given(userService.findActiveUserById(1L)).willReturn(manager);
        given(projectService.findProject(10L)).willReturn(project);

        Project otherProject = TestFixtures.project(99L, manager);
        Sprint foreignSprint = TestFixtures.sprint(500L, otherProject, SprintStatus.PLANNING);
        given(sprintRepository.findById(500L)).willReturn(Optional.of(foreignSprint));

        TaskRequest req = new TaskRequest();
        req.setTaskName("Test Task");
        req.setStoryPoints(3);
        req.setSprintId(500L);

        assertThatThrownBy(() -> taskService.createTask(1L, 10L, req))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Sprint does not belong to this project");
    }

    // --- helpers ---

    private StatusChangeRequest doneRequest(BigDecimal hours) {
        StatusChangeRequest r = new StatusChangeRequest();
        r.setStatus(TaskStatus.DONE);
        r.setActualHours(hours);
        return r;
    }

    private StatusChangeRequest statusRequest(TaskStatus status) {
        StatusChangeRequest r = new StatusChangeRequest();
        r.setStatus(status);
        return r;
    }
}
