package com.springboot.MyTodoList.project.dashboard;

import com.springboot.MyTodoList.common.enums.SprintStatus;
import com.springboot.MyTodoList.common.enums.TaskPriority;
import com.springboot.MyTodoList.common.enums.TaskStatus;
import com.springboot.MyTodoList.common.exception.ConflictException;
import com.springboot.MyTodoList.project.Project;
import com.springboot.MyTodoList.project.ProjectService;
import com.springboot.MyTodoList.sprint.Sprint;
import com.springboot.MyTodoList.sprint.SprintRepository;
import com.springboot.MyTodoList.task.Task;
import com.springboot.MyTodoList.task.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectService projectService;
    private final SprintRepository sprintRepository;
    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public SprintSummaryResponse getSprintSummary(Long userId, Long projectId) {
        Project project = projectService.findProject(projectId);
        projectService.requireParticipant(userId, project);
        Sprint sprint = getActiveSprint(project);
        List<Task> tasks = taskRepository.findByProject(project).stream()
                .filter(t -> sprint.equals(t.getSprint())).toList();

        long committed = tasks.stream().mapToLong(Task::getStoryPoints).sum();
        long completed = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE)
                .mapToLong(Task::getStoryPoints).sum();

        return SprintSummaryResponse.builder()
                .sprintId(sprint.getId())
                .sprintName(sprint.getSprintName())
                .totalTasks(tasks.size())
                .todoTasks((int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count())
                .inProgressTasks((int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count())
                .blockedTasks((int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.BLOCKED).count())
                .doneTasks((int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count())
                .spCommitted(committed)
                .spCompleted(completed)
                .completionPercent(committed == 0 ? 0 : (double) completed / committed * 100)
                .build();
    }

    @Transactional(readOnly = true)
    public VelocityResponse getVelocity(Long userId, Long projectId, int sprintCount) {
        Project project = projectService.findProject(projectId);
        projectService.requireParticipant(userId, project);
        List<Sprint> closedSprints = sprintRepository.findByProjectAndStatus(project, SprintStatus.CLOSED);
        List<Sprint> recent = closedSprints.stream()
                .sorted((a, b) -> b.getEndDate().compareTo(a.getEndDate()))
                .limit(sprintCount)
                .toList();

        List<VelocityResponse.SprintVelocity> velocities = recent.stream().map(s -> {
            Long sp = taskRepository.sumStoryPointsBySprintAndStatus(s, TaskStatus.DONE);
            return new VelocityResponse.SprintVelocity(s.getId(), s.getSprintName(), sp == null ? 0 : sp);
        }).toList();

        return new VelocityResponse(velocities);
    }

    @Transactional(readOnly = true)
    public BurndownResponse getBurndown(Long userId, Long projectId) {
        Project project = projectService.findProject(projectId);
        projectService.requireParticipant(userId, project);
        Sprint sprint = getActiveSprint(project);

        Long total = taskRepository.sumStoryPointsBySprint(sprint);
        Long completed = taskRepository.sumStoryPointsBySprintAndStatus(sprint, TaskStatus.DONE);
        long totalSp = total == null ? 0 : total;
        long completedSp = completed == null ? 0 : completed;
        long remaining = totalSp - completedSp;

        long totalDays = ChronoUnit.DAYS.between(sprint.getStartDate(), sprint.getEndDate());
        long elapsedDays = ChronoUnit.DAYS.between(sprint.getStartDate(), LocalDate.now());
        double idealBurnPercent = totalDays == 0 ? 100 : Math.min(100, (double) elapsedDays / totalDays * 100);
        double actualBurnPercent = totalSp == 0 ? 0 : (double) completedSp / totalSp * 100;

        return new BurndownResponse(sprint.getId(), sprint.getSprintName(),
                totalSp, completedSp, remaining, idealBurnPercent, actualBurnPercent);
    }

    @Transactional(readOnly = true)
    public WorkloadResponse getWorkload(Long userId, Long projectId) {
        Project project = projectService.findProject(projectId);
        projectService.requireParticipant(userId, project);
        List<Task> allTasks = taskRepository.findByProject(project).stream()
                .filter(t -> t.getAssignedTo() != null).toList();

        Map<Long, List<Task>> byUser = allTasks.stream()
                .collect(Collectors.groupingBy(t -> t.getAssignedTo().getId()));

        List<WorkloadResponse.MemberWorkload> workloads = byUser.entrySet().stream().map(e -> {
            List<Task> userTasks = e.getValue();
            return new WorkloadResponse.MemberWorkload(
                    e.getKey(),
                    userTasks.get(0).getAssignedTo().getFullName(),
                    userTasks.size(),
                    userTasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count(),
                    userTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count(),
                    userTasks.stream().filter(t -> t.getStatus() == TaskStatus.BLOCKED).count(),
                    userTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count()
            );
        }).toList();

        return new WorkloadResponse(workloads);
    }

    @Transactional(readOnly = true)
    public BacklogResponse getBacklog(Long userId, Long projectId) {
        Project project = projectService.findProject(projectId);
        projectService.requireParticipant(userId, project);
        List<Task> backlog = taskRepository.findByProjectAndSprintIsNull(project);

        long totalSp = backlog.stream().mapToLong(Task::getStoryPoints).sum();
        return new BacklogResponse(
                backlog.size(), totalSp,
                backlog.stream().filter(t -> t.getPriority() == TaskPriority.HIGH).count(),
                backlog.stream().filter(t -> t.getPriority() == TaskPriority.MEDIUM).count(),
                backlog.stream().filter(t -> t.getPriority() == TaskPriority.LOW).count(),
                backlog.stream().filter(t -> t.getPriority() == null).count()
        );
    }

    private Sprint getActiveSprint(Project project) {
        List<Sprint> active = sprintRepository.findByProjectAndStatus(project, SprintStatus.ACTIVE);
        if (active.isEmpty()) {
            throw new ConflictException("No active sprint found for project: " + project.getId());
        }
        return active.get(0);
    }
}
