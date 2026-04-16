package com.springboot.MyTodoList.config;

import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.model.Project;
import com.springboot.MyTodoList.model.ProjectMember;
import com.springboot.MyTodoList.model.ProjectStatus;
import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.model.SprintStatus;
import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.model.TaskPriority;
import com.springboot.MyTodoList.model.TaskStatus;
import com.springboot.MyTodoList.repository.AppUserRepository;
import com.springboot.MyTodoList.repository.ProjectMemberRepository;
import com.springboot.MyTodoList.repository.ProjectRepository;
import com.springboot.MyTodoList.repository.SprintRepository;
import com.springboot.MyTodoList.repository.TaskRepository;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AnalyticsDemoDataInitializer {

    private final AppUserRepository appUserRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final SprintRepository sprintRepository;
    private final TaskRepository taskRepository;

    public AnalyticsDemoDataInitializer(AppUserRepository appUserRepository,
                                        ProjectRepository projectRepository,
                                        ProjectMemberRepository projectMemberRepository,
                                        SprintRepository sprintRepository,
                                        TaskRepository taskRepository) {
        this.appUserRepository = appUserRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.sprintRepository = sprintRepository;
        this.taskRepository = taskRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedAnalyticsData() {
        if (projectRepository.count() > 0L) {
            return;
        }

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        AppUser carlos = createUser("Carlos Vega", "carlos.vega@oracle-javabot.demo");
        AppUser ana = createUser("Ana Torres", "ana.torres@oracle-javabot.demo");
        AppUser luis = createUser("Luis García", "luis.garcia@oracle-javabot.demo");
        AppUser sofia = createUser("Sofía Rojas", "sofia.rojas@oracle-javabot.demo");

        Project project = new Project();
        project.setProjectName("Oracle Java Bot");
        project.setDescription("Agile delivery analytics demo project");
        project.setStatus(ProjectStatus.ACTIVE);
        project.setManager(carlos);
        project.setCreatedAt(now.minusDays(21));
        project = projectRepository.save(project);

        seedMember(project, ana, now.minusDays(20));
        seedMember(project, luis, now.minusDays(20));
        seedMember(project, sofia, now.minusDays(20));

        Sprint sprint1 = createSprint(project, "Sprint 1", "Platform stabilization", LocalDate.now().minusWeeks(3), LocalDate.now().minusWeeks(2), SprintStatus.CLOSED, now.minusDays(20));
        Sprint sprint2 = createSprint(project, "Sprint 2", "Delivery hardening", LocalDate.now().minusWeeks(2), LocalDate.now().minusWeeks(1), SprintStatus.CLOSED, now.minusDays(13));
        Sprint sprint3 = createSprint(project, "Sprint 3", "Release preparation", LocalDate.now().minusWeeks(1), LocalDate.now().plusWeeks(1), SprintStatus.ACTIVE, now.minusDays(6));

        taskRepository.saveAll(Arrays.asList(
                createTask(project, sprint1, carlos, carlos, "Prepare demo backlog", TaskStatus.DONE, TaskPriority.HIGH, 5d, 3.5d, now.minusDays(19), now.minusDays(18)),
                createTask(project, sprint1, ana, carlos, "Document task flow", TaskStatus.DONE, TaskPriority.MEDIUM, 3d, 5.0d, now.minusDays(19), now.minusDays(17)),
                createTask(project, sprint1, luis, carlos, "Fix integration bug", TaskStatus.BLOCKED, TaskPriority.HIGH, 8d, 2.0d, now.minusDays(18), null),
                createTask(project, sprint1, sofia, carlos, "Review API contract", TaskStatus.IN_PROGRESS, TaskPriority.MEDIUM, 2d, 1.5d, now.minusDays(18), null),

                createTask(project, sprint2, carlos, ana, "Improve bot onboarding", TaskStatus.DONE, TaskPriority.MEDIUM, 5d, 4.0d, now.minusDays(12), now.minusDays(11)),
                createTask(project, sprint2, ana, ana, "Create analytics dashboard", TaskStatus.DONE, TaskPriority.HIGH, 13d, 6.5d, now.minusDays(12), now.minusDays(10)),
                createTask(project, sprint2, luis, ana, "Tune Oracle queries", TaskStatus.DONE, TaskPriority.MEDIUM, 5d, 2.0d, now.minusDays(11), now.minusDays(9)),
                createTask(project, sprint2, sofia, ana, "Refine React components", TaskStatus.DONE, TaskPriority.HIGH, 8d, 7.5d, now.minusDays(12), now.minusDays(9)),

                createTask(project, sprint3, carlos, luis, "Address sprint blockers", TaskStatus.BLOCKED, TaskPriority.HIGH, 3d, 2.5d, now.minusDays(6), null),
                createTask(project, sprint3, ana, luis, "Polish KPI cards", TaskStatus.DONE, TaskPriority.MEDIUM, 3d, 1.75d, now.minusDays(6), now.minusDays(4)),
                createTask(project, sprint3, luis, luis, "Create insights API", TaskStatus.DONE, TaskPriority.HIGH, 8d, 3.0d, now.minusDays(6), now.minusDays(3)),
                createTask(project, sprint3, sofia, luis, "Validate sprint metrics", TaskStatus.IN_PROGRESS, TaskPriority.MEDIUM, 3d, 4.25d, now.minusDays(5), null),

                createTask(project, null, luis, carlos, "Backlog: improve task assignment rules", TaskStatus.TODO, TaskPriority.LOW, 2d, 1.0d, now.minusDays(2), null),
                createTask(project, null, ana, carlos, "Backlog: refine sprint labels", TaskStatus.TODO, TaskPriority.LOW, 1d, 0.5d, now.minusDays(1), null)
        ));
    }

    private AppUser createUser(String fullName, String email) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user != null) {
            return user;
        }

        user = new AppUser();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setActive(true);
        user.setCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));
        return appUserRepository.save(user);
    }

    private void seedMember(Project project, AppUser user, OffsetDateTime createdAt) {
        if (projectMemberRepository.existsByProject_IdAndUser_Id(project.getId(), user.getId())) {
            return;
        }

        ProjectMember member = new ProjectMember();
        member.setProject(project);
        member.setUser(user);
        member.setCreatedAt(createdAt);
        projectMemberRepository.save(member);
    }

    private Sprint createSprint(Project project, String name, String goal, LocalDate startDate, LocalDate endDate, SprintStatus status, OffsetDateTime createdAt) {
        Sprint sprint = new Sprint();
        sprint.setProject(project);
        sprint.setSprintName(name);
        sprint.setGoal(goal);
        sprint.setStartDate(startDate);
        sprint.setEndDate(endDate);
        sprint.setStatus(status);
        sprint.setCreatedAt(createdAt);
        return sprintRepository.save(sprint);
    }

    private Task createTask(Project project,
                            Sprint sprint,
                            AppUser assignedTo,
                            AppUser createdBy,
                            String name,
                            TaskStatus status,
                            TaskPriority priority,
                            double storyPoints,
                            double realHours,
                            OffsetDateTime createdAt,
                            OffsetDateTime completedAt) {
        Task task = new Task();
        task.setProject(project);
        task.setSprint(sprint);
        task.setAssignedTo(assignedTo);
        task.setCreatedBy(createdBy);
        task.setTaskName(name);
        task.setDescription(name + " - seeded analytics item");
        task.setStatus(status);
        task.setPriority(priority);
        task.setStoryPoints(storyPoints);
        task.setRealHours(realHours);
        task.setCreatedAt(createdAt);
        task.setUpdatedAt(completedAt == null ? createdAt.plusHours(2) : completedAt);
        task.setCompletedAt(completedAt);
        return task;
    }
}