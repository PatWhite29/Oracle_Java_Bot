package com.springboot.MyTodoList.telegram.handler;

import com.springboot.MyTodoList.telegram.TelegramHelper;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.generics.TelegramClient;

@Component
public class HelpHandler {

    private static final String HELP =
            "📋 Chuva Bot — Available commands\n\n" +
            "🔐 Authentication\n" +
            "  /login {email} {password} — Link your account\n\n" +
            "📁 Projects\n" +
            "  /my_projects — List your projects\n\n" +
            "✅ Tasks\n" +
            "  /my_tasks — List tasks assigned to you\n" +
            "  /task {id} — View task details\n" +
            "  /task_status {id} {status} — Change task status\n" +
            "    Statuses: TODO · IN_PROGRESS · BLOCKED · DONE\n" +
            "  /comment {id} {text} — Add a comment to a task";

    public void handle(Update update, TelegramClient client) {
        Long chatId = update.getMessage().getChatId();
        TelegramHelper.send(client, chatId, HELP);
    }
}
