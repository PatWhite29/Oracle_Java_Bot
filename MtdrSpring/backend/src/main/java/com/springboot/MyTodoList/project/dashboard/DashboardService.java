package com.springboot.MyTodoList.project.dashboard;

import com.springboot.MyTodoList.common.enums.SprintStatus;
import com.springboot.MyTodoList.common.enums.TaskPriority;
import com.springboot.MyTodoList.common.enums.TaskStatus;
import com.springboot.MyTodoList.common.exception.ResourceNotFoundException;
import com.springboot.MyTodoList.project.Project;
import com.springboot.MyTodoList.project.ProjectService;
import com.springboot.MyTodoList.project.member.ProjectMember;
import com.springboot.MyTodoList.project.member.ProjectMemberRepository;
import com.springboot.MyTodoList.sprint.Sprint;
import com.springboot.MyTodoList.sprint.SprintRepository;
import com.springboot.MyTodoList.task.TaskRepository;
import com.springboot.MyTodoList.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectService projectService;
    private final SprintRepository sprintRepository;
    private final TaskRepository taskRepository;
    private final ProjectMemberRepository memberRepository;

    @Transactional(readOnly = true)
    public SprintSummaryResponse getSprintSummary(Long userId, Long projectId, Long sprintId) {
        Project project = projectService.findProject(projectId);
        projectService.requireParticipant(userId, project);
        Sprint sprint = resolveSprint(project, sprintId);

        Map<String, Integer> statusCounts = new LinkedHashMap<>();
        for (TaskStatus s : TaskStatus.values()) statusCounts.put(s.name(), 0);

        long committed = 0;
        long completed = 0;

        for (Object[] row : taskRepository.findStatusCountsAndSpBySprint(sprint)) {
            TaskStatus status = (TaskStatus) row[0];
            int count = ((Long) row[1]).intValue();
            long sp = row[2] == null ? 0L : ((Number) row[2]).longValue();
            statusCounts.put(status.name(), count);
            committed += sp;
            if (status == TaskStatus.DONE) completed = sp;
        }

        double pct = committed == 0 ? 0.0 : (double) completed / committed * 100.0;

        return SprintSummaryResponse.builder()
                .sprintId(sprint.getId())
                .sprintName(sprint.getSprintName())
                .statusCounts(statusCounts)
                .spCommitted(committed)
                .spCompleted(completed)
                .completionPercentage(pct)
                .blockedCount(statusCounts.getOrDefault("BLOCKED", 0))
                .build();
    }

    @Transactional(readOnly = true)
    public List<VelocityResponse> getVelocity(Long userId, Long projectId, int sprintCount) {
        Project project = projectService.findProject(projectId);
        projectService.requireParticipant(userId, project);

        List<Sprint> closed = sprintRepository.findByProjectAndStatus(project, SprintStatus.CLOSED)
                .stream()
                .sorted(Comparator.comparing(Sprint::getEndDate))
                .toList();

        return closed.stream()
                .skip(Math.max(0, closed.size() - sprintCount))
                .map(s -> {
                    Long sp = taskRepository.sumStoryPointsBySprintAndStatus(s, TaskStatus.DONE);
                    return new VelocityResponse(s.getId(), s.getSprintName(), sp == null ? 0L : sp);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public EfficiencyResponse getEfficiency(Long userId, Long projectId, Long sprintId) {
        Project project = projectService.findProject(projectId);
        projectService.requireParticipant(userId, project);
        Sprint sprint = resolveSprint(project, sprintId);

        List<EfficiencyResponse.MemberEfficiency> members = new ArrayList<>();
        double totalHours = 0.0;
        long totalSp = 0L;

        for (Object[] row : taskRepository.findEfficiencyBySprint(sprint, TaskStatus.DONE)) {
            Long memberId = (Long) row[0];
            String fullName = (String) row[1];
            long sp = row[2] == null ? 0L : ((Number) row[2]).longValue();
            double hours = row[3] == null ? 0.0 : ((BigDecimal) row[3]).doubleValue();
            members.add(new EfficiencyResponse.MemberEfficiency(memberId, fullName, sp, hours));
            totalSp += sp;
            totalHours += hours;
        }

        return new EfficiencyResponse(sprint.getId(), sprint.getSprintName(), totalHours, totalSp, members);
    }

    @Transactional(readOnly = true)
    public List<WorkloadResponse> getWorkload(Long userId, Long projectId, Long sprintId) {
        Project project = projectService.findProject(projectId);
        projectService.requireParticipant(userId, project);
        Sprint sprint = resolveSprint(project, sprintId);

        // task counts and SP per user per status, from DB
        Map<Long, Map<String, Long>> taskCountByUser = new HashMap<>();
        Map<Long, Map<String, Long>> spByUser = new HashMap<>();

        for (Object[] row : taskRepository.findWorkloadBySprint(sprint)) {
            Long memberId = (Long) row[0];
            String status = ((TaskStatus) row[2]).name();
            long count = (Long) row[3];
            long sp = row[4] == null ? 0L : ((Number) row[4]).longValue();

            taskCountByUser.computeIfAbsent(memberId, k -> new HashMap<>()).put(status, count);
            spByUser.computeIfAbsent(memberId, k -> new HashMap<>()).put(status, sp);
        }

        // all project participants: manager + members
        List<User> participants = new ArrayList<>();
        participants.add(project.getManager());
        memberRepository.findAllByProject(project).stream()
                .map(ProjectMember::getEmployee)
                .filter(u -> !u.getId().equals(project.getManager().getId()))
                .forEach(participants::add);

        String[] statuses = {"TODO", "IN_PROGRESS", "BLOCKED", "DONE"};

        return participants.stream().map(member -> {
            Map<String, Long> counts = new LinkedHashMap<>();
            Map<String, Long> sp = new LinkedHashMap<>();
            for (String s : statuses) {
                counts.put(s, taskCountByUser.getOrDefault(member.getId(), Map.of()).getOrDefault(s, 0L));
                sp.put(s, spByUser.getOrDefault(member.getId(), Map.of()).getOrDefault(s, 0L));
            }
            return new WorkloadResponse(member.getId(), member.getFullName(), counts, sp);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BacklogResponse getBacklog(Long userId, Long projectId) {
        Project project = projectService.findProject(projectId);
        projectService.requireParticipant(userId, project);

        long total = taskRepository.countBacklogByProject(project);
        Long sumSp = taskRepository.sumBacklogSpByProject(project);
        long totalSp = sumSp == null ? 0L : sumSp;

        Map<String, Long> byPriority = new LinkedHashMap<>();
        byPriority.put("HIGH", 0L);
        byPriority.put("MEDIUM", 0L);
        byPriority.put("LOW", 0L);
        byPriority.put("NONE", 0L);

        for (Object[] row : taskRepository.findBacklogPriorityCountsByProject(project)) {
            TaskPriority priority = (TaskPriority) row[0];
            long count = (Long) row[1];
            byPriority.put(priority == null ? "NONE" : priority.name(), count);
        }

        return new BacklogResponse(total, totalSp, byPriority);
    }

    @Transactional(readOnly = true)
    public BurndownResponse getBurndown(Long userId, Long projectId, Long sprintId) {
        Project project = projectService.findProject(projectId);
        projectService.requireParticipant(userId, project);

        Sprint sprint = resolveSprint(project, sprintId);

        Long total = taskRepository.sumStoryPointsBySprint(sprint);
        Long completed = taskRepository.sumStoryPointsBySprintAndStatus(sprint, TaskStatus.DONE);
        long totalSp = total == null ? 0L : total;
        long completedSp = completed == null ? 0L : completed;

        long totalDays = ChronoUnit.DAYS.between(sprint.getStartDate(), sprint.getEndDate());
        long elapsedDays = ChronoUnit.DAYS.between(sprint.getStartDate(), LocalDate.now());
        double idealBurnPercent = totalDays == 0 ? 100.0 : Math.min(100.0, (double) elapsedDays / totalDays * 100.0);
        double actualBurnPercent = totalSp == 0 ? 0.0 : (double) completedSp / totalSp * 100.0;

        return new BurndownResponse(sprint.getId(), sprint.getSprintName(),
                totalSp, completedSp, totalSp - completedSp, idealBurnPercent, actualBurnPercent);
    }

    private Sprint resolveSprint(Project project, Long sprintId) {
        if (sprintId != null) {
            return sprintRepository.findById(sprintId)
                    .filter(s -> s.getProject().getId().equals(project.getId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Sprint not found: " + sprintId));
        }
        return sprintRepository.findByProjectAndStatus(project, SprintStatus.ACTIVE)
                .stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No active sprint for project " + project.getId()));
    }
}
