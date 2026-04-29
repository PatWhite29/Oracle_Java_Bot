package com.springboot.MyTodoList.project;

import com.springboot.MyTodoList.audit.AuditLogService;
import com.springboot.MyTodoList.common.PagedResponse;
import com.springboot.MyTodoList.common.enums.AuditAction;
import com.springboot.MyTodoList.common.enums.EntityType;
import com.springboot.MyTodoList.common.enums.ProjectStatus;
import com.springboot.MyTodoList.common.enums.SprintStatus;
import com.springboot.MyTodoList.common.exception.ForbiddenException;
import com.springboot.MyTodoList.common.exception.NotProjectParticipantException;
import com.springboot.MyTodoList.common.exception.ResourceNotFoundException;
import com.springboot.MyTodoList.project.member.ProjectMember;
import com.springboot.MyTodoList.project.member.ProjectMemberRepository;
import com.springboot.MyTodoList.sprint.Sprint;
import com.springboot.MyTodoList.sprint.SprintRepository;
import com.springboot.MyTodoList.task.Task;
import com.springboot.MyTodoList.task.TaskRepository;
import com.springboot.MyTodoList.task.activity.TaskActivityRepository;
import com.springboot.MyTodoList.user.User;
import com.springboot.MyTodoList.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final SprintRepository sprintRepository;
    private final TaskRepository taskRepository;
    private final TaskActivityRepository activityRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;
    private final ProjectMapper projectMapper;

    @Transactional
    public ProjectResponse createProject(Long userId, ProjectRequest request) {
        User manager = userService.findActiveUserById(userId);
        Project project = Project.builder()
                .projectName(request.getProjectName())
                .description(request.getDescription())
                .status(ProjectStatus.ACTIVE)
                .manager(manager)
                .build();
        projectRepository.save(project);
        memberRepository.save(ProjectMember.builder().project(project).employee(manager).build());
        auditLogService.log(manager, EntityType.PROJECT, project.getId(), AuditAction.CREATE, null, project);
        return projectMapper.toResponse(project);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProjectResponse> getMyProjects(Long userId, Pageable pageable) {
        return PagedResponse.of(
                projectRepository.findAllByParticipant(userId, pageable)
                        .map(projectMapper::toResponse)
        );
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(Long userId, Long projectId) {
        Project project = findProject(projectId);
        requireParticipant(userId, project);
        return projectMapper.toResponse(project);
    }

    @Transactional
    public ProjectResponse updateProject(Long userId, Long projectId, ProjectRequest request) {
        User actor = userService.findActiveUserById(userId);
        Project project = findProject(projectId);
        requireManager(userId, project);
        Project old = cloneForAudit(project);
        project.setProjectName(request.getProjectName());
        project.setDescription(request.getDescription());
        projectRepository.save(project);
        auditLogService.log(actor, EntityType.PROJECT, project.getId(), AuditAction.UPDATE, old, project);
        return projectMapper.toResponse(project);
    }

    @Transactional
    public void deleteProject(Long userId, Long projectId) {
        User actor = userService.findActiveUserById(userId);
        Project project = findProject(projectId);
        requireManager(userId, project);
        auditLogService.log(actor, EntityType.PROJECT, project.getId(), AuditAction.DELETE, project, null);
        activityRepository.deleteByTask_Project(project);
        taskRepository.deleteByProject(project);
        sprintRepository.deleteByProject(project);
        memberRepository.deleteByProject(project);
        projectRepository.delete(project);
    }

    @Transactional
    public CloseProjectResponse closeProject(Long userId, Long projectId) {
        User actor = userService.findActiveUserById(userId);
        Project project = findProject(projectId);
        requireManager(userId, project);

        List<Sprint> openSprints = sprintRepository.findByProjectAndStatus(project, SprintStatus.PLANNING);
        openSprints.addAll(sprintRepository.findByProjectAndStatus(project, SprintStatus.ACTIVE));
        openSprints.forEach(s -> s.setStatus(SprintStatus.CLOSED));
        sprintRepository.saveAll(openSprints);

        List<Task> pendingTasks = taskRepository.findByProject(project).stream()
                .filter(t -> t.getStatus() != com.springboot.MyTodoList.common.enums.TaskStatus.DONE)
                .toList();

        project.setStatus(ProjectStatus.CLOSED);
        projectRepository.save(project);
        auditLogService.log(actor, EntityType.PROJECT, project.getId(), AuditAction.UPDATE, null, project);

        return new CloseProjectResponse(
                project.getId(),
                project.getProjectName(),
                openSprints.size(),
                pendingTasks.size(),
                "Project closed. " + openSprints.size() + " sprint(s) closed, " +
                        pendingTasks.size() + " task(s) left incomplete."
        );
    }

    @Transactional
    public ProjectResponse transferProject(Long userId, Long projectId, TransferRequest request) {
        User actor = userService.findActiveUserById(userId);
        Project project = findProject(projectId);
        requireManager(userId, project);
        User newManager = userService.findActiveUserById(request.getNewManagerId());
        if (!memberRepository.existsByProjectAndEmployee(project, newManager)) {
            throw new ForbiddenException("The new manager must be a member of the project");
        }
        project.setManager(newManager);
        projectRepository.save(project);
        auditLogService.log(actor, EntityType.PROJECT, project.getId(), AuditAction.UPDATE, null, project);
        return projectMapper.toResponse(project);
    }

    public Project findProject(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));
    }

    public void requireManager(Long userId, Project project) {
        if (!project.getManager().getId().equals(userId)) {
            throw new ForbiddenException("Only the project manager can perform this action");
        }
    }

    public void requireParticipant(Long userId, Project project) {
        // Manager OR member: handled by checking manager or if participant query returns something
        // We reuse the repository query indirectly — simpler to check inline
        boolean isManager = project.getManager().getId().equals(userId);
        if (!isManager) {
            boolean isMember = projectRepository.findAllByParticipant(userId,
                    org.springframework.data.domain.Pageable.unpaged()).stream()
                    .anyMatch(p -> p.getId().equals(project.getId()));
            if (!isMember) {
                throw new NotProjectParticipantException("You are not a participant of this project");
            }
        }
    }

    private Project cloneForAudit(Project project) {
        Project clone = new Project();
        clone.setId(project.getId());
        clone.setProjectName(project.getProjectName());
        clone.setDescription(project.getDescription());
        clone.setStatus(project.getStatus());
        return clone;
    }
}
