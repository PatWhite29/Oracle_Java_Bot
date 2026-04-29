package com.springboot.MyTodoList.project;

import com.springboot.MyTodoList.TestFixtures;
import com.springboot.MyTodoList.audit.AuditLogService;
import com.springboot.MyTodoList.common.enums.SprintStatus;
import com.springboot.MyTodoList.common.enums.TaskStatus;
import com.springboot.MyTodoList.common.exception.ForbiddenException;
import com.springboot.MyTodoList.common.exception.NotProjectParticipantException;
import com.springboot.MyTodoList.project.member.ProjectMemberRepository;
import com.springboot.MyTodoList.sprint.Sprint;
import com.springboot.MyTodoList.sprint.SprintRepository;
import com.springboot.MyTodoList.task.Task;
import com.springboot.MyTodoList.task.TaskRepository;
import com.springboot.MyTodoList.task.activity.TaskActivityRepository;
import com.springboot.MyTodoList.user.User;
import com.springboot.MyTodoList.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock ProjectRepository projectRepository;
    @Mock ProjectMemberRepository memberRepository;
    @Mock SprintRepository sprintRepository;
    @Mock TaskRepository taskRepository;
    @Mock TaskActivityRepository activityRepository;
    @Mock UserService userService;
    @Mock AuditLogService auditLogService;
    @Mock ProjectMapper projectMapper;
    @InjectMocks ProjectService projectService;

    User manager;
    User stranger;
    Project project;

    @BeforeEach
    void setUp() {
        manager = TestFixtures.user(1L);
        stranger = TestFixtures.user(99L);
        project = TestFixtures.project(10L, manager);

        given(projectRepository.findById(10L)).willReturn(Optional.of(project));
        given(projectMapper.toResponse(any())).willReturn(new ProjectResponse());
    }

    // --- requireManager ---

    @Test
    void requireManager_withManager_passes() {
        assertThatCode(() -> projectService.requireManager(1L, project))
                .doesNotThrowAnyException();
    }

    @Test
    void requireManager_withNonManager_throwsForbidden() {
        assertThatThrownBy(() -> projectService.requireManager(99L, project))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Only the project manager");
    }

    // --- requireParticipant ---

    @Test
    void requireParticipant_withManager_passes() {
        assertThatCode(() -> projectService.requireParticipant(1L, project))
                .doesNotThrowAnyException();
    }

    @Test
    void requireParticipant_withStranger_throws() {
        given(projectRepository.findAllByParticipant(eq(99L), any(Pageable.class)))
                .willReturn(Page.empty());

        assertThatThrownBy(() -> projectService.requireParticipant(99L, project))
                .isInstanceOf(NotProjectParticipantException.class);
    }

    // --- closeProject ---

    @Test
    void closeProject_autoclosesPlanningAndActiveSprints() {
        given(userService.findActiveUserById(1L)).willReturn(manager);

        Sprint planning = TestFixtures.sprint(1L, project, SprintStatus.PLANNING);
        Sprint active = TestFixtures.sprint(2L, project, SprintStatus.ACTIVE);

        given(sprintRepository.findByProjectAndStatus(project, SprintStatus.PLANNING)).willReturn(List.of(planning));
        given(sprintRepository.findByProjectAndStatus(project, SprintStatus.ACTIVE)).willReturn(List.of(active));
        given(taskRepository.findByProject(project)).willReturn(List.of());

        projectService.closeProject(1L, 10L);

        assertThat(planning.getStatus()).isEqualTo(SprintStatus.CLOSED);
        assertThat(active.getStatus()).isEqualTo(SprintStatus.CLOSED);
        verify(sprintRepository).saveAll(any());
    }

    @Test
    void closeProject_returnsCorrectPendingTaskCount() {
        given(userService.findActiveUserById(1L)).willReturn(manager);
        given(sprintRepository.findByProjectAndStatus(any(), any())).willReturn(List.of());

        Task doneTask = TestFixtures.task(1L, project, null);
        doneTask.setStatus(TaskStatus.DONE);
        Task pendingTask = TestFixtures.task(2L, project, null);
        pendingTask.setStatus(TaskStatus.IN_PROGRESS);

        given(taskRepository.findByProject(project)).willReturn(List.of(doneTask, pendingTask));

        CloseProjectResponse response = projectService.closeProject(1L, 10L);

        assertThat(response.getPendingTasks()).isEqualTo(1);
    }
}
