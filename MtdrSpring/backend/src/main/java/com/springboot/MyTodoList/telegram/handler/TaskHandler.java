package com.springboot.MyTodoList.telegram.handler;

import com.springboot.MyTodoList.common.exception.NotProjectParticipantException;
import com.springboot.MyTodoList.common.exception.ResourceNotFoundException;
import com.springboot.MyTodoList.task.TaskResponse;
import com.springboot.MyTodoList.task.TaskService;
import com.springboot.MyTodoList.telegram.TelegramHelper;
import com.springboot.MyTodoList.user.User;
import com.springboot.MyTodoList.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.generics.TelegramClient;

@Component
@RequiredArgsConstructor
public class TaskHandler {

    private final UserService userService;
    private final TaskService taskService;

    public void handle(Update update, TelegramClient client) {
        Long chatId = update.getMessage().getChatId();

        User user = userService.findByTelegramChatId(chatId);
        if (user == null) {
            TelegramHelper.send(client, chatId, "Account not linked. Use /login {email} {password} first.");
            return;
        }

        String[] parts = update.getMessage().getText().trim().split("\s+");
        if (parts.length < 2) {
            TelegramHelper.send(client, chatId, "Usage: /task {id}");
            return;
        }

        long taskId;
        try {
            taskId = Long.parseLong(parts[1]);
        } catch (NumberFormatException e) {
            TelegramHelper.send(client, chatId, "Invalid task ID: " + parts[1]);
            return;
        }

        try {
            TaskResponse t = taskService.getTaskForUser(user.getId(), taskId);

            StringBuilder sb = new StringBuilder();
            sb.append("Task #").append(t.getId()).append("\n\n");
            sb.append("Name: ").append(t.getTaskName()).append("\n");
            sb.append("Status: ").append(t.getStatus()).append("\n");
            if (t.getPriority() != null) sb.append("Priority: ").append(t.getPriority()).append("\n");
            sb.append("Story Points: ").append(t.getStoryPoints()).append("\n");
            if (t.getSprint() != null) sb.append("Sprint: ").append(t.getSprint().getSprintName()).append("\n");
            if (t.getAssignedTo() != null) sb.append("Assigned to: ").append(t.getAssignedTo().getFullName()).append("\n");
            if (t.getDescription() != null && !t.getDescription().isBlank()) {
                sb.append("\n").append(t.getDescription());
            }

            TelegramHelper.send(client, chatId, sb.toString().trim());
        } catch (ResourceNotFoundException e) {
            TelegramHelper.send(client, chatId, "Task #" + taskId + " not found.");
        } catch (NotProjectParticipantException e) {
            TelegramHelper.send(client, chatId, "You are not a member of the project this task belongs to.");
        }
    }
}
