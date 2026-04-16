package com.springboot.MyTodoList.project.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class VelocityResponse {
    private List<SprintVelocity> sprints;

    @Getter
    @AllArgsConstructor
    public static class SprintVelocity {
        private Long sprintId;
        private String sprintName;
        private long storyPointsCompleted;
    }
}
