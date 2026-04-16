package com.springboot.MyTodoList.user;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private Long telegramChatId;
    private LocalDateTime createdAt;
}
