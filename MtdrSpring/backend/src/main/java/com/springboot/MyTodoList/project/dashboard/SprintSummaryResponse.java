package com.springboot.MyTodoList.project.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
@AllArgsConstructor
public class SprintSummaryResponse {
    private Long sprintId;
    private String sprintName;
    private Map<String, Integer> statusCounts;
    private long spCommitted;
    private long spCompleted;
    private double completionPercentage;
    private int blockedCount;
}
