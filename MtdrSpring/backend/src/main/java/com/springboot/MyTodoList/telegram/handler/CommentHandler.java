package com.springboot.MyTodoList.telegram.handler;

import com.springboot.MyTodoList.common.exception.NotProjectParticipantException;
import com.springboot.MyTodoList.common.exception.ResourceNotFoundException;
import com.springboot.MyTodoList.task.activity.TaskActivityService;
import com.springboot.MyTodoList.telegram.TelegramHelper;
import com.springboot.MyTodoList.user.User;
import com.springboot.MyTodoList.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.generics.TelegramClient;

@Component
@RequiredArgsConstructor
public class CommentHandler {

    private final UserService userService;
    private final TaskActivityService activityService;

    public void handle(Update update, TelegramClient client) {
        Long chatId = update.getMessage().getChatId();

        User user = userService.findByTelegramChatId(chatId);
        if (user == null) {
            TelegramHelper.send(client, chatId, "Account not linked. Use /login {email} {password} first.");
            return;
        }

        String text = update.getMessage().getText().trim();
        String[] parts = text.split("\s+", 3);
        if (parts.length < 3) {
            TelegramHelper.send(client, chatId, "Usage: /comment {id} {text}");
            return;
        }

        long taskId;
        try {
            taskId = Long.parseLong(parts[1]);
        } catch (NumberFormatException e) {
            TelegramHelper.send(client, chatId, "Invalid task ID: " + parts[1]);
            return;
        }

        String content = parts[2].trim();
        if (content.length() > 2000) {
            TelegramHelper.send(client, chatId, "Comment is too long (max 2000 characters).");
            return;
        }

        try {
            activityService.addCommentById(user.getId(), taskId, content);
            TelegramHelper.send(client, chatId, "Comment added to task #" + taskId + ".");
        } catch (ResourceNotFoundException e) {
            TelegramHelper.send(client, chatId, "Task #" + taskId + " not found.");
        } catch (NotProjectParticipantException e) {
            TelegramHelper.send(client, chatId, "You are not a member of the project this task belongs to.");
        }
    }
}
