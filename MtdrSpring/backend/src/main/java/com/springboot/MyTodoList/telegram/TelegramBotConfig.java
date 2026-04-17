package com.springboot.MyTodoList.telegram;

import org.springframework.context.annotation.Configuration;

@Configuration
public class TelegramBotConfig {
    // ChuvaBot is conditionally registered via @ConditionalOnExpression on the component itself.
    // This config class is a placeholder for future Telegram-specific beans (e.g., TelegramClient).
}
