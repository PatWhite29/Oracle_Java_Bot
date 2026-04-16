package com.springboot.MyTodoList.project;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CloseProjectResponse {
    private Long projectId;
    private String projectName;
    private int sprintsClosed;
    private int pendingTasks;
    private String message;
}
