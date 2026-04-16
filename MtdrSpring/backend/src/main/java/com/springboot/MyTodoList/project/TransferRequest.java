package com.springboot.MyTodoList.project;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransferRequest {
    @NotNull
    private Long newManagerId;
}
