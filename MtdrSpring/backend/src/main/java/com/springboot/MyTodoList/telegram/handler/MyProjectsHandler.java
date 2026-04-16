package com.springboot.MyTodoList.telegram.handler;

import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.objects.Update;

@Component
public class MyProjectsHandler {
    // TODO: handle /my_projects — list projects where user is manager or member, using telegramChatId to resolve identity
    public void handle(Update update) {}
}
