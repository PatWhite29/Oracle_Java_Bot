package com.springboot.MyTodoList.project;

import com.springboot.MyTodoList.common.enums.ProjectStatus;
import com.springboot.MyTodoList.user.UserSummary;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ProjectResponse {
    private Long id;
    private String projectName;
    private String description;
    private ProjectStatus status;
    private UserSummary manager;
    private LocalDateTime createdAt;
}
