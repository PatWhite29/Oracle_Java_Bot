package com.springboot.MyTodoList.task;

import com.springboot.MyTodoList.common.enums.TaskPriority;
import com.springboot.MyTodoList.common.enums.TaskStatus;
import com.springboot.MyTodoList.sprint.SprintSummary;
import com.springboot.MyTodoList.user.UserSummary;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TaskResponse {
    private Long id;
    private Long projectId;
    private Long sprintId;
    private SprintSummary sprint;
    private String taskName;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private Integer storyPoints;
    private UserSummary assignedTo;
    private UserSummary createdBy;
    private LocalDateTime createdAt;
}
