package com.springboot.MyTodoList.telegram.handler;

import com.springboot.MyTodoList.common.enums.SprintStatus;
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

        List<TaskResponse> activeTasks = tasks.stream()
                .filter(t -> t.getSprint() != null && t.getSprint().getStatus() == SprintStatus.ACTIVE)
                .toList();
        List<TaskResponse> planningTasks = tasks.stream()
                .filter(t -> t.getSprint() != null && t.getSprint().getStatus() == SprintStatus.PLANNING)
                .toList();
        List<TaskResponse> backlogTasks = tasks.stream()
                .filter(t -> t.getSprint() == null)
                .toList();

        StringBuilder sb = new StringBuilder("📋 Your tasks:\n");

        if (!activeTasks.isEmpty()) {
            sb.append("\n🟢 Active sprint\n");
            appendTasks(sb, activeTasks);
        }
        if (!planningTasks.isEmpty()) {
            sb.append("\n🔵 Planning sprint\n");
            appendTasks(sb, planningTasks);
        }
        if (!backlogTasks.isEmpty()) {
            sb.append("\n📦 Backlog\n");
            appendTasks(sb, backlogTasks);
        }

        TelegramHelper.send(client, chatId, sb.toString().trim());
    }

    private void appendTasks(StringBuilder sb, List<TaskResponse> tasks) {
        for (TaskResponse t : tasks) {
            sb.append("• [").append(t.getId()).append("] ").append(t.getTaskName()).append("\n");
            sb.append("  ").append(t.getStatus());
            if (t.getPriority() != null) sb.append(" · ").append(t.getPriority());
            if (t.getStoryPoints() != null) sb.append(" · ").append(t.getStoryPoints()).append("SP");
            sb.append("\n");
        }
    }
}
