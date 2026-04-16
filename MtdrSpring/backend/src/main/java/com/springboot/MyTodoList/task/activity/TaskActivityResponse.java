package com.springboot.MyTodoList.task.activity;

import com.springboot.MyTodoList.common.enums.ActivityType;
import com.springboot.MyTodoList.user.UserSummary;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TaskActivityResponse {
    private Long id;
    private Long taskId;
    private UserSummary employee;
    private ActivityType activityType;
    private String content;
    private LocalDateTime createdAt;
}
