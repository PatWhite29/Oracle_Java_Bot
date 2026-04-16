package com.springboot.MyTodoList.sprint;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class SprintRequest {
    @NotBlank @Size(max = 100)
    private String sprintName;
    @Size(max = 500)
    private String goal;
    @NotNull
    private LocalDate startDate;
    @NotNull
    private LocalDate endDate;
}
