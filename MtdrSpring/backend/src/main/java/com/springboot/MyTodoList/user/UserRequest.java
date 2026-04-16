package com.springboot.MyTodoList.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRequest {
    @NotBlank @Size(max = 100)
    private String fullName;
    @NotBlank @Email @Size(max = 100)
    private String email;
}
