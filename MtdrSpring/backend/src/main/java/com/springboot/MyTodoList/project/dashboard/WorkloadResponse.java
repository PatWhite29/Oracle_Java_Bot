package com.springboot.MyTodoList.project.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Map;

@Getter
@AllArgsConstructor
public class WorkloadResponse {
    private Long userId;
    private String fullName;
    private Map<String, Long> taskCounts;
    private Map<String, Long> storyPoints;
}
