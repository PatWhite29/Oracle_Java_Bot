package com.springboot.MyTodoList.telegram.handler;

import com.springboot.MyTodoList.task.TaskResponse;
import com.springboot.MyTodoList.task.TaskService;
import com.springboot.MyTodoList.telegram.TelegramHelper;
import com.springboot.MyTodoList.user.User;
import com.springboot.MyTodoList.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.generics.TelegramClient;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MyTasksHandler {

    private final UserService userService;
    private final TaskService taskService;

    public void handle(Update update, TelegramClient client) {
        Long chatId = update.getMessage().getChatId();

        User user = userService.findByTelegramChatId(chatId);
        if (user == null) {
            TelegramHelper.send(client, chatId, "❌ Account not linked. Use /login {email} {password} first.");
            return;
        }

        List<TaskResponse> tasks = taskService.getMyAssignedTasks(user.getId());

        if (tasks.isEmpty()) {
            TelegramHelper.send(client, chatId, "You have no tasks assigned to you.");
            return;
        }

        StringBuilder sb = new StringBuilder("✅ Your tasks:\n\n");
        for (TaskResponse t : tasks) {
            sb.append("• [").append(t.getId()).append("] ")
              .append(t.getTaskName()).append("\n")
              .append("  Status: ").append(t.getStatus());
            if (t.getPriority() != null) sb.append(" · ").append(t.getPriority());
            if (t.getSprint() != null) sb.append(" · ").append(t.getSprint().getSprintName());
            sb.append("\n");
        }

        TelegramHelper.send(client, chatId, sb.toString().trim());
    }
}
