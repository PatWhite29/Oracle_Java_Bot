package com.springboot.MyTodoList.telegram;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "telegram.bot.token", matchIfMissing = false, havingValue = "")
public class TelegramBotConfig {
    // Telegram bot beans are conditionally loaded only when TELEGRAM_BOT_TOKEN is set.
    // ChuvaBot registers itself via @ConditionalOnProperty on the component level.
}
