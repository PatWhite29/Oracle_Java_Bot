package com.springboot.MyTodoList.sprint;

import com.springboot.MyTodoList.audit.AuditLogService;
import com.springboot.MyTodoList.common.PagedResponse;
import com.springboot.MyTodoList.common.enums.AuditAction;
import com.springboot.MyTodoList.common.enums.EntityType;
import com.springboot.MyTodoList.common.enums.SprintStatus;
import com.springboot.MyTodoList.common.exception.ConflictException;
import com.springboot.MyTodoList.common.exception.ForbiddenException;
import com.springboot.MyTodoList.common.exception.ResourceNotFoundException;
import com.springboot.MyTodoList.project.Project;
import com.springboot.MyTodoList.project.ProjectService;
import com.springboot.MyTodoList.user.User;
import com.springboot.MyTodoList.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectService projectService;
    private final UserService userService;
    private final AuditLogService auditLogService;
    private final SprintMapper sprintMapper;

    @Transactional
    public SprintResponse createSprint(Long userId, Long projectId, SprintRequest request) {
        User actor = userService.findActiveUserById(userId);
        Project project = projectService.findProject(projectId);
        projectService.requireManager(userId, project);
        validateDates(request);

        Sprint sprint = Sprint.builder()
                .project(project)
                .sprintName(request.getSprintName())
                .goal(request.getGoal())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(SprintStatus.PLANNING)
                .build();
        sprintRepository.save(sprint);
        auditLogService.log(actor, EntityType.SPRINT, sprint.getId(), AuditAction.CREATE, null, sprint);
        return sprintMapper.toResponse(sprint);
    }

    @Transactional(readOnly = true)
    public PagedResponse<SprintResponse> listSprints(Long userId, Long projectId, Pageable pageable) {
        Project project = projectService.findProject(projectId);
        projectService.requireParticipant(userId, project);
        return PagedResponse.of(sprintRepository.findByProject(project, pageable).map(sprintMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public SprintResponse getSprint(Long userId, Long projectId, Long sprintId) {
        Project project = projectService.findProject(projectId);
        projectService.requireParticipant(userId, project);
        Sprint sprint = findSprint(sprintId, project);
        return sprintMapper.toResponse(sprint);
    }

    @Transactional
    public SprintResponse updateSprint(Long userId, Long projectId, Long sprintId, SprintRequest request) {
        User actor = userService.findActiveUserById(userId);
        Project project = projectService.findProject(projectId);
        projectService.requireManager(userId, project);
        Sprint sprint = findSprint(sprintId, project);
        if (sprint.getStatus() == SprintStatus.CLOSED) {
            throw new ForbiddenException("Cannot edit a closed sprint");
        }
        validateDates(request);
        Sprint old = cloneForAudit(sprint);
        sprint.setSprintName(request.getSprintName());
        sprint.setGoal(request.getGoal());
        sprint.setStartDate(request.getStartDate());
        sprint.setEndDate(request.getEndDate());
        sprintRepository.save(sprint);
        auditLogService.log(actor, EntityType.SPRINT, sprint.getId(), AuditAction.UPDATE, old, sprint);
        return sprintMapper.toResponse(sprint);
    }

    @Transactional
    public SprintResponse activateSprint(Long userId, Long projectId, Long sprintId) {
        User actor = userService.findActiveUserById(userId);
        Project project = projectService.findProject(projectId);
        projectService.requireManager(userId, project);
        Sprint sprint = findSprint(sprintId, project);
        if (sprint.getStatus() != SprintStatus.PLANNING) {
            throw new ConflictException("Only a PLANNING sprint can be activated");
        }
        if (sprintRepository.existsByProjectAndStatus(project, SprintStatus.ACTIVE)) {
            throw new ConflictException("SPRINT_ALREADY_ACTIVE: Project already has an active sprint");
        }
        sprint.setStatus(SprintStatus.ACTIVE);
        sprintRepository.save(sprint);
        auditLogService.log(actor, EntityType.SPRINT, sprint.getId(), AuditAction.UPDATE, null, sprint);
        return sprintMapper.toResponse(sprint);
    }

    @Transactional
    public SprintResponse closeSprint(Long userId, Long projectId, Long sprintId) {
        User actor = userService.findActiveUserById(userId);
        Project project = projectService.findProject(projectId);
        projectService.requireManager(userId, project);
        Sprint sprint = findSprint(sprintId, project);
        if (sprint.getStatus() == SprintStatus.CLOSED) {
            throw new ConflictException("Sprint is already closed");
        }
        sprint.setStatus(SprintStatus.CLOSED);
        sprintRepository.save(sprint);
        auditLogService.log(actor, EntityType.SPRINT, sprint.getId(), AuditAction.UPDATE, null, sprint);
        return sprintMapper.toResponse(sprint);
    }

    public Sprint findSprint(Long sprintId, Project project) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found: " + sprintId));
        if (!sprint.getProject().getId().equals(project.getId())) {
            throw new ResourceNotFoundException("Sprint not found in project: " + sprintId);
        }
        return sprint;
    }

    private void validateDates(SprintRequest request) {
        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new ConflictException("end_date must be after start_date");
        }
    }

    private Sprint cloneForAudit(Sprint sprint) {
        Sprint clone = new Sprint();
        clone.setId(sprint.getId());
        clone.setSprintName(sprint.getSprintName());
        clone.setGoal(sprint.getGoal());
        clone.setStartDate(sprint.getStartDate());
        clone.setEndDate(sprint.getEndDate());
        clone.setStatus(sprint.getStatus());
        return clone;
    }
}
