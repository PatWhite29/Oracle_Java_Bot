package com.springboot.MyTodoList.project.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class VelocityResponse {
    private Long sprintId;
    private String sprintName;
    private long spCompleted;
}
