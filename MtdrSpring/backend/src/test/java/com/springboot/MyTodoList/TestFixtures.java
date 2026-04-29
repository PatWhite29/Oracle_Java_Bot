package com.springboot.MyTodoList;

import com.springboot.MyTodoList.common.enums.ProjectStatus;
import com.springboot.MyTodoList.common.enums.SprintStatus;
import com.springboot.MyTodoList.common.enums.TaskStatus;
import com.springboot.MyTodoList.project.Project;
import com.springboot.MyTodoList.sprint.Sprint;
import com.springboot.MyTodoList.task.Task;
import com.springboot.MyTodoList.user.User;

import java.time.LocalDate;

public class TestFixtures {

    public static User user(Long id) {
        return User.builder()
                .id(id)
                .fullName("User " + id)
                .email("user" + id + "@test.com")
                .passwordHash("$2a$10$hashedpassword")
                .isActive(true)
                .build();
    }

    public static Project project(Long id, User manager) {
        return Project.builder()
                .id(id)
                .projectName("Project " + id)
                .description("Test project")
                .status(ProjectStatus.ACTIVE)
                .manager(manager)
                .build();
    }

    public static Sprint sprint(Long id, Project project, SprintStatus status) {
        return Sprint.builder()
                .id(id)
                .project(project)
                .sprintName("Sprint " + id)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(14))
                .status(status)
                .build();
    }

    public static Task task(Long id, Project project, Sprint sprint) {
        return Task.builder()
                .id(id)
                .project(project)
                .sprint(sprint)
                .taskName("Task " + id)
                .status(TaskStatus.TODO)
                .storyPoints(3)
                .createdBy(project.getManager())
                .build();
    }
}
