package com.springboot.MyTodoList.telegram.handler;

import com.springboot.MyTodoList.telegram.TelegramHelper;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.generics.TelegramClient;

@Component
public class StartHandler {

    private static final String WELCOME =
            "👋 Welcome to Chuva Bot!\n\n" +
            "I help you manage your tasks from Telegram.\n\n" +
            "To get started, link your account:\n" +
            "  /login {email} {password}\n\n" +
            "Then use /help to see all available commands.";

    public void handle(Update update, TelegramClient client) {
        Long chatId = update.getMessage().getChatId();
        TelegramHelper.send(client, chatId, WELCOME);
    }
}
