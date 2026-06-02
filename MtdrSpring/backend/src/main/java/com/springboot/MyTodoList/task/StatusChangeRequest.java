package com.springboot.MyTodoList.task;

import com.springboot.MyTodoList.common.enums.TaskStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class StatusChangeRequest {
    @NotNull
    private TaskStatus status;
    @Positive(message = "must be greater than 0")
    @DecimalMax(value = "999.99", message = "must not exceed 999.99")
    @Digits(integer = 4, fraction = 2, message = "allows at most 2 decimal places")
    private BigDecimal actualHours;
}
