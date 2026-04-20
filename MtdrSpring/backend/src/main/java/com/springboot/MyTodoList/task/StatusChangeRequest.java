package com.springboot.MyTodoList.task;

import com.springboot.MyTodoList.common.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class StatusChangeRequest {
    @NotNull
    private TaskStatus status;
    private BigDecimal actualHours;
}
