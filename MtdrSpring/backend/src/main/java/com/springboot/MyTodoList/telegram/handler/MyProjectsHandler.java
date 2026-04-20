package com.springboot.MyTodoList.telegram.handler;

import com.springboot.MyTodoList.common.PagedResponse;
import com.springboot.MyTodoList.project.ProjectResponse;
import com.springboot.MyTodoList.project.ProjectService;
import com.springboot.MyTodoList.telegram.TelegramHelper;
import com.springboot.MyTodoList.user.User;
import com.springboot.MyTodoList.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.generics.TelegramClient;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MyProjectsHandler {

    private final UserService userService;
    private final ProjectService projectService;

    public void handle(Update update, TelegramClient client) {
        Long chatId = update.getMessage().getChatId();

        User user = userService.findByTelegramChatId(chatId);
        if (user == null) {
            TelegramHelper.send(client, chatId, "❌ Account not linked. Use /login {email} {password} first.");
            return;
        }

        PagedResponse<ProjectResponse> page = projectService.getMyProjects(user.getId(), Pageable.unpaged());
        List<ProjectResponse> projects = page.content();

        if (projects.isEmpty()) {
            TelegramHelper.send(client, chatId, "You have no projects yet.");
            return;
        }

        StringBuilder sb = new StringBuilder("📁 Your projects:\n\n");
        for (ProjectResponse p : projects) {
            sb.append("• [").append(p.getId()).append("] ")
              .append(p.getProjectName())
              .append(" (").append(p.getStatus()).append(")\n");
            boolean isManager = p.getManager() != null && p.getManager().getId().equals(user.getId());
            if (isManager) sb.append("  👑 You are the manager\n");
        }

        TelegramHelper.send(client, chatId, sb.toString().trim());
    }
}
