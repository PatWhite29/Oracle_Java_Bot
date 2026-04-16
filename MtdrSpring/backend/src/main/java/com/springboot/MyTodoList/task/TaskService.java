package com.springboot.MyTodoList.task;

import com.springboot.MyTodoList.audit.AuditLogService;
import com.springboot.MyTodoList.common.PagedResponse;
import com.springboot.MyTodoList.common.enums.*;
import com.springboot.MyTodoList.common.exception.ForbiddenException;
import com.springboot.MyTodoList.common.exception.ResourceNotFoundException;
import com.springboot.MyTodoList.notification.NotificationService;
import com.springboot.MyTodoList.project.Project;
import com.springboot.MyTodoList.project.ProjectService;
import com.springboot.MyTodoList.sprint.Sprint;
import com.springboot.MyTodoList.sprint.SprintRepository;
import com.springboot.MyTodoList.sprint.SprintService;
import com.springboot.MyTodoList.task.activity.TaskActivity;
import com.springboot.MyTodoList.task.activity.TaskActivityRepository;
import com.springboot.MyTodoList.user.User;
import com.springboot.MyTodoList.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskActivityRepository activityRepository;
    private final SprintRepository sprintRepository;
    private final ProjectService projectService;
    private final SprintService sprintService;
    private final UserService userService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final TaskMapper taskMapper;

    @Transactional
    public TaskResponse createTask(Long userId, Long projectId, TaskRequest request) {
        User actor = userService.findActiveUserById(userId);
        Project project = projectService.findProject(projectId);
        projectService.requireManager(userId, project);

        Sprint sprint = resolveSprint(request.getSprintId(), project);
        User assignedTo = request.getAssignedTo() != null
                ? userService.findActiveUserById(request.getAssignedTo()) : null;

        Task task = Task.builder()
                .project(project)
                .sprint(sprint)
                .taskName(request.getTaskName())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .priority(request.getPriority())
                .storyPoints(request.getStoryPoints())
                .assignedTo(assignedTo)
                .createdBy(actor)
                .build();
        taskRepository.save(task);
        auditLogService.log(actor, EntityType.TASK, task.getId(), AuditAction.CREATE, null, task);
        return taskMapper.toResponse(task);
    }

    @Transactional(readOnly = true)
    public PagedResponse<TaskResponse> listTasks(Long userId, Long projectId,
                                                   TaskStatus status, Long sprintId,
                                                   Long assignedToId, TaskPriority priority,
                                                   Pageable pageable) {
        Project project = projectService.findProject(projectId);
        projectService.requireParticipant(userId, project);
        Sprint sprint = sprintId != null ? sprintRepository.findById(sprintId).orElse(null) : null;
        User assignedTo = assignedToId != null ? userService.findActiveUserById(assignedToId) : null;
        return PagedResponse.of(
                taskRepository.findByProjectWithFilters(project, status, sprint, assignedTo, priority, pageable)
                        .map(taskMapper::toResponse)
        );
    }

    @Transactional(readOnly = true)
    public TaskResponse getTask(Long userId, Long projectId, Long taskId) {
        Project project = projectService.findProject(projectId);
        projectService.requireParticipant(userId, project);
        Task task = findTask(taskId, project);
        return taskMapper.toResponse(task);
    }

    @Transactional
    public TaskResponse updateTask(Long userId, Long projectId, Long taskId, TaskRequest request) {
        User actor = userService.findActiveUserById(userId);
        Project project = projectService.findProject(projectId);
        projectService.requireManager(userId, project);
        Task task = findTask(taskId, project);
        requireNotClosedSprint(task);

        Sprint sprint = resolveSprint(request.getSprintId(), project);
        User assignedTo = request.getAssignedTo() != null
                ? userService.findActiveUserById(request.getAssignedTo()) : null;

        Task old = cloneForAudit(task);
        task.setTaskName(request.getTaskName());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());
        task.setStoryPoints(request.getStoryPoints());
        task.setAssignedTo(assignedTo);
        task.setSprint(sprint);
        taskRepository.save(task);
        auditLogService.log(actor, EntityType.TASK, task.getId(), AuditAction.UPDATE, old, task);
        return taskMapper.toResponse(task);
    }

    @Transactional
    public void deleteTask(Long userId, Long projectId, Long taskId) {
        User actor = userService.findActiveUserById(userId);
        Project project = projectService.findProject(projectId);
        projectService.requireManager(userId, project);
        Task task = findTask(taskId, project);
        auditLogService.log(actor, EntityType.TASK, task.getId(), AuditAction.DELETE, task, null);
        taskRepository.delete(task);
    }

    @Transactional
    public TaskResponse changeStatus(Long userId, Long projectId, Long taskId, StatusChangeRequest request) {
        User actor = userService.findActiveUserById(userId);
        Project project = projectService.findProject(projectId);
        Task task = findTask(taskId, project);
        requireNotClosedSprint(task);

        boolean isManager = project.getManager().getId().equals(userId);
        boolean isAssigned = task.getAssignedTo() != null && task.getAssignedTo().getId().equals(userId);
        if (!isManager && !isAssigned) {
            throw new ForbiddenException("Only the project manager or assigned user can change task status");
        }

        TaskStatus oldStatus = task.getStatus();
        task.setStatus(request.getStatus());
        taskRepository.save(task);

        activityRepository.save(TaskActivity.builder()
                .task(task)
                .employee(actor)
                .activityType(ActivityType.STATUS_CHANGE)
                .content(oldStatus + " → " + request.getStatus())
                .build());
        auditLogService.log(actor, EntityType.TASK, task.getId(), AuditAction.UPDATE, oldStatus, request.getStatus());

        if (request.getStatus() == TaskStatus.BLOCKED) {
            try {
                notificationService.send(project.getManager(), "TASK_BLOCKED",
                        "Task '" + task.getTaskName() + "' is BLOCKED in project '" + project.getProjectName() + "'");
            } catch (Exception ignored) {}
        }
        if (task.getAssignedTo() != null) {
            try {
                notificationService.send(task.getAssignedTo(), "TASK_STATUS_CHANGE",
                        "Task '" + task.getTaskName() + "' status changed to " + request.getStatus());
            } catch (Exception ignored) {}
        }

        return taskMapper.toResponse(task);
    }

    @Transactional
    public TaskResponse changeSprint(Long userId, Long projectId, Long taskId, SprintChangeRequest request) {
        User actor = userService.findActiveUserById(userId);
        Project project = projectService.findProject(projectId);
        projectService.requireManager(userId, project);
        Task task = findTask(taskId, project);

        Sprint newSprint = resolveSprint(request.getSprintId(), project);
        Sprint oldSprint = task.getSprint();

        task.setSprint(newSprint);
        taskRepository.save(task);

        activityRepository.save(TaskActivity.builder()
                .task(task)
                .employee(actor)
                .activityType(ActivityType.SPRINT_CHANGE)
                .content("Moved from sprint " + sprintLabel(oldSprint) + " to " + sprintLabel(newSprint))
                .build());
        auditLogService.log(actor, EntityType.TASK, task.getId(), AuditAction.UPDATE, oldSprint, newSprint);

        return taskMapper.toResponse(task);
    }

    public Task findTask(Long taskId, Project project) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));
        if (!task.getProject().getId().equals(project.getId())) {
            throw new ResourceNotFoundException("Task not found in project: " + taskId);
        }
        return task;
    }

    private Sprint resolveSprint(Long sprintId, Project project) {
        if (sprintId == null) return null;
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found: " + sprintId));
        if (!sprint.getProject().getId().equals(project.getId())) {
            throw new ForbiddenException("Sprint does not belong to this project");
        }
        return sprint;
    }

    private void requireNotClosedSprint(Task task) {
        if (task.getSprint() != null &&
                task.getSprint().getStatus() == com.springboot.MyTodoList.common.enums.SprintStatus.CLOSED) {
            throw new ForbiddenException("Tasks in closed sprints are read-only (except sprint assignment)");
        }
    }

    private String sprintLabel(Sprint sprint) {
        return sprint == null ? "backlog" : sprint.getSprintName();
    }

    private Task cloneForAudit(Task task) {
        Task clone = new Task();
        clone.setId(task.getId());
        clone.setTaskName(task.getTaskName());
        clone.setStatus(task.getStatus());
        clone.setPriority(task.getPriority());
        clone.setStoryPoints(task.getStoryPoints());
        return clone;
    }
}
