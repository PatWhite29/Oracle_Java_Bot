package com.springboot.MyTodoList.sprint;

import com.springboot.MyTodoList.common.enums.SprintStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class SprintResponse {
    private Long id;
    private Long projectId;
    private String sprintName;
    private String goal;
    private LocalDate startDate;
    private LocalDate endDate;
    private SprintStatus status;
    private LocalDateTime createdAt;
}
