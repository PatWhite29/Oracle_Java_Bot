package com.springboot.MyTodoList.sprint;

import com.springboot.MyTodoList.TestFixtures;
import com.springboot.MyTodoList.audit.AuditLogService;
import com.springboot.MyTodoList.common.enums.SprintStatus;
import com.springboot.MyTodoList.common.exception.ConflictException;
import com.springboot.MyTodoList.common.exception.ForbiddenException;
import com.springboot.MyTodoList.project.Project;
import com.springboot.MyTodoList.project.ProjectService;
import com.springboot.MyTodoList.user.User;
import com.springboot.MyTodoList.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class SprintServiceTest {

    @Mock SprintRepository sprintRepository;
    @Mock ProjectService projectService;
    @Mock UserService userService;
    @Mock AuditLogService auditLogService;
    @Mock SprintMapper sprintMapper;
    @InjectMocks SprintService sprintService;

    User manager;
    Project project;
    Sprint sprint;

    @BeforeEach
    void setUp() {
        manager = TestFixtures.user(1L);
        project = TestFixtures.project(10L, manager);
        sprint = TestFixtures.sprint(100L, project, SprintStatus.PLANNING);

        given(userService.findActiveUserById(1L)).willReturn(manager);
        given(projectService.findProject(10L)).willReturn(project);
        given(sprintRepository.findById(100L)).willReturn(Optional.of(sprint));
        given(sprintMapper.toResponse(any())).willReturn(new SprintResponse());
    }

    @Test
    void createSprint_whenEndDateBeforeStartDate_throwsConflict() {
        SprintRequest request = new SprintRequest();
        request.setSprintName("Bad Sprint");
        request.setStartDate(LocalDate.now().plusDays(5));
        request.setEndDate(LocalDate.now());

        assertThatThrownBy(() -> sprintService.createSprint(1L, 10L, request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("end_date must be after start_date");
    }

    @Test
    void createSprint_success_savesCalled() {
        SprintRequest request = new SprintRequest();
        request.setSprintName("Sprint 1");
        request.setStartDate(LocalDate.now());
        request.setEndDate(LocalDate.now().plusDays(14));

        sprintService.createSprint(1L, 10L, request);

        verify(sprintRepository).save(any(Sprint.class));
    }

    @Test
    void activateSprint_whenNoneActive_transitionsToActive() {
        given(sprintRepository.existsByProjectAndStatus(project, SprintStatus.ACTIVE)).willReturn(false);

        sprintService.activateSprint(1L, 10L, 100L);

        assertThat(sprint.getStatus()).isEqualTo(SprintStatus.ACTIVE);
        verify(sprintRepository).save(sprint);
    }

    @Test
    void activateSprint_whenAnotherAlreadyActive_throwsConflict() {
        given(sprintRepository.existsByProjectAndStatus(project, SprintStatus.ACTIVE)).willReturn(true);

        assertThatThrownBy(() -> sprintService.activateSprint(1L, 10L, 100L))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("SPRINT_ALREADY_ACTIVE");
    }

    @Test
    void activateSprint_whenNotPlanning_throwsConflict() {
        sprint.setStatus(SprintStatus.ACTIVE);

        assertThatThrownBy(() -> sprintService.activateSprint(1L, 10L, 100L))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Only a PLANNING sprint can be activated");
    }

    @Test
    void updateSprint_whenClosed_throwsForbidden() {
        sprint.setStatus(SprintStatus.CLOSED);
        SprintRequest request = new SprintRequest();
        request.setSprintName("Updated");
        request.setStartDate(LocalDate.now());
        request.setEndDate(LocalDate.now().plusDays(14));

        assertThatThrownBy(() -> sprintService.updateSprint(1L, 10L, 100L, request))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Cannot edit a closed sprint");
    }

    @Test
    void closeSprint_success_setsStatusToClosed() {
        sprint.setStatus(SprintStatus.ACTIVE);

        sprintService.closeSprint(1L, 10L, 100L);

        assertThat(sprint.getStatus()).isEqualTo(SprintStatus.CLOSED);
        verify(sprintRepository).save(sprint);
    }

    @Test
    void closeSprint_whenAlreadyClosed_throwsConflict() {
        sprint.setStatus(SprintStatus.CLOSED);

        assertThatThrownBy(() -> sprintService.closeSprint(1L, 10L, 100L))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already closed");
    }

    @Test
    void reopenSprint_whenNotClosed_throwsConflict() {
        sprint.setStatus(SprintStatus.PLANNING);

        assertThatThrownBy(() -> sprintService.reopenSprint(1L, 10L, 100L))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Only a CLOSED sprint can be reopened");
    }
}
