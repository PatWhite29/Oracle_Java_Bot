package com.springboot.MyTodoList.project.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class WorkloadResponse {
    private List<MemberWorkload> members;

    @Getter
    @AllArgsConstructor
    public static class MemberWorkload {
        private Long userId;
        private String fullName;
        private long totalTasks;
        private long todoTasks;
        private long inProgressTasks;
        private long blockedTasks;
        private long doneTasks;
    }
}
