package com.springboot.MyTodoList.project.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Map;

@Getter
@AllArgsConstructor
public class BacklogResponse {
    private long totalTasks;
    private long totalStoryPoints;
    private Map<String, Long> byPriority;
}
