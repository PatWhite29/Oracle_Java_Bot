package com.springboot.MyTodoList.project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectRequest {
    @NotBlank @Size(max = 100)
    private String projectName;
    @Size(max = 500)
    private String description;
}
