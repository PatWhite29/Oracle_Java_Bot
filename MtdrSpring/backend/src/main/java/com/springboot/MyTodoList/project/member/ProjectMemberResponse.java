package com.springboot.MyTodoList.project.member;

import com.springboot.MyTodoList.user.UserSummary;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ProjectMemberResponse {
    private Long id;
    private UserSummary employee;
    private LocalDateTime createdAt;
}
