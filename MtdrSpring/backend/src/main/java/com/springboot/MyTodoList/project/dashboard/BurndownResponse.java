package com.springboot.MyTodoList.project.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BurndownResponse {
    private Long sprintId;
    private String sprintName;
    private long totalStoryPoints;
    private long completedStoryPoints;
    private long remainingStoryPoints;
    private double idealBurnPercent;
    private double actualBurnPercent;
}
