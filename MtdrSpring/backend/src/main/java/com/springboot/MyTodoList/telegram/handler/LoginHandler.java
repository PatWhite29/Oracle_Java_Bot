package com.springboot.MyTodoList.telegram.handler;

import com.springboot.MyTodoList.telegram.TelegramHelper;
import com.springboot.MyTodoList.user.User;
import com.springboot.MyTodoList.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.generics.TelegramClient;

@Component
@RequiredArgsConstructor
@Slf4j
public class LoginHandler {

    private final UserService userService;

    public void handle(Update update, TelegramClient client) {
        Long chatId = update.getMessage().getChatId();
        String text = update.getMessage().getText().trim();
        String[] parts = text.split("\s+");

        if (parts.length < 3) {
            TelegramHelper.send(client, chatId, "Usage: /login {email} {password}");
            return;
        }

        // Check if already linked
        User existing = userService.findByTelegramChatId(chatId);
        if (existing != null) {
            TelegramHelper.send(client, chatId,
                    "✅ You are already linked as " + existing.getFullName() + ".\n" +
                    "Use /help to see available commands.");
            return;
        }

        String email = parts[1];
        String password = parts[2];

        try {
            userService.linkTelegramChatId(email, password, chatId);
            User user = userService.findByTelegramChatId(chatId);
            TelegramHelper.send(client, chatId,
                    "✅ Account linked successfully!\n\n" +
                    "Welcome, " + user.getFullName() + "!\n" +
                    "Use /help to see available commands.");
        } catch (BadCredentialsException e) {
            TelegramHelper.send(client, chatId, "❌ Invalid email or password. Please try again.");
        } catch (Exception e) {
            log.error("Login handler error for chatId {}: {}", chatId, e.getMessage());
            TelegramHelper.send(client, chatId, "❌ An error occurred. Please try again later.");
        }
    }
}
