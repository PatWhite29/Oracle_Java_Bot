package com.springboot.MyTodoList.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    @NotBlank @Size(max = 100)
    private String fullName;
    @NotBlank @Email @Size(max = 100)
    private String email;
    @NotBlank @Size(min = 6, max = 100)
    private String password;
}
