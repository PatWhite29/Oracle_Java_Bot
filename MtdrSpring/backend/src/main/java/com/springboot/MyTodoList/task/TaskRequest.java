package com.springboot.MyTodoList.task;

import com.springboot.MyTodoList.common.enums.TaskPriority;
import com.springboot.MyTodoList.common.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TaskRequest {
    @NotBlank @Size(max = 200)
    private String taskName;
    @Size(max = 1000)
    private String description;
    @NotNull
    private TaskStatus status;
    private TaskPriority priority;
    @NotNull
    private Integer storyPoints;
    private Long assignedTo;
    private Long sprintId;
}
