package com.springboot.MyTodoList.telegram.handler;

import com.springboot.MyTodoList.common.enums.TaskStatus;
import com.springboot.MyTodoList.common.exception.ClosedSprintException;
import com.springboot.MyTodoList.common.exception.ForbiddenException;
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

import java.util.Arrays;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class TaskStatusHandler {

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
        if (parts.length < 3) {
            TelegramHelper.send(client, chatId,
                    "Usage: /task_status {id} {status}\nValid statuses: TODO, IN_PROGRESS, BLOCKED, DONE");
            return;
        }

        long taskId;
        try {
            taskId = Long.parseLong(parts[1]);
        } catch (NumberFormatException e) {
            TelegramHelper.send(client, chatId, "Invalid task ID: " + parts[1]);
            return;
        }

        TaskStatus newStatus;
        try {
            newStatus = TaskStatus.valueOf(parts[2].toUpperCase());
        } catch (IllegalArgumentException e) {
            String valid = Arrays.stream(TaskStatus.values()).map(Enum::name).collect(Collectors.joining(", "));
            TelegramHelper.send(client, chatId, "Invalid status. Valid options: " + valid);
            return;
        }

        try {
            TaskResponse updated = taskService.changeStatusById(user.getId(), taskId, newStatus);
            TelegramHelper.send(client, chatId, "Task #" + taskId + " status updated to " + updated.getStatus() + ".");
        } catch (ResourceNotFoundException e) {
            TelegramHelper.send(client, chatId, "Task #" + taskId + " not found.");
        } catch (ClosedSprintException e) {
            TelegramHelper.send(client, chatId,
                    "Cannot modify task #" + taskId + ". It belongs to a closed sprint and is read-only.");
        } catch (NotProjectParticipantException e) {
            TelegramHelper.send(client, chatId, "You are not a member of the project this task belongs to.");
        } catch (ForbiddenException e) {
            TelegramHelper.send(client, chatId,
                    "You don't have permission to change this task's status. " +
                    "Only the project manager or the assigned user can do this.");
        }
    }
}
