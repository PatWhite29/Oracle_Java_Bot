package com.springboot.MyTodoList.project.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class EfficiencyResponse {
    private Long sprintId;
    private String sprintName;
    private double totalActualHours;
    private long totalSpCompleted;
    private List<MemberEfficiency> members;

    @Getter
    @AllArgsConstructor
    public static class MemberEfficiency {
        private Long userId;
        private String fullName;
        private long spCompleted;
        private double actualHours;
    }
}
