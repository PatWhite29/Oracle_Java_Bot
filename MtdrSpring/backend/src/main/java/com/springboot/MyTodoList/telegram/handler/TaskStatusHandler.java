package com.springboot.MyTodoList.telegram.handler;

import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.objects.Update;

@Component
public class TaskStatusHandler {
    // TODO: handle /task_status {id} {status} — change task status (calls TaskService.changeStatus)
    // Allowed statuses: TODO, IN_PROGRESS, BLOCKED, DONE
    public void handle(Update update) {}
}
