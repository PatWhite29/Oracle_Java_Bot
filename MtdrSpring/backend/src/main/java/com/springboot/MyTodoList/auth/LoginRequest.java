package com.springboot.MyTodoList.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    @NotBlank @Email
    private String email;
    @NotBlank @Size(max = 100, message = "must not exceed 100 characters")
    private String password;
}
