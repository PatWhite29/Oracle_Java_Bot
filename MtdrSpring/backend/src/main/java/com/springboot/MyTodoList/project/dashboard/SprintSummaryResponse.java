package com.springboot.MyTodoList.project.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SprintSummaryResponse {
    private Long sprintId;
    private String sprintName;
    private int totalTasks;
    private int todoTasks;
    private int inProgressTasks;
    private int blockedTasks;
    private int doneTasks;
    private long spCommitted;
    private long spCompleted;
    private double completionPercent;
}
