package com.springboot.MyTodoList.telegram;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.client.okhttp.OkHttpTelegramClient;
import org.telegram.telegrambots.longpolling.interfaces.LongPollingUpdateConsumer;
import org.telegram.telegrambots.longpolling.starter.SpringLongPollingBot;
import org.telegram.telegrambots.longpolling.util.LongPollingSingleThreadUpdateConsumer;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.generics.TelegramClient;

@Component
@ConditionalOnExpression("!'${telegram.bot.token:}'.isEmpty()")
@Slf4j
public class ChuvaBot implements SpringLongPollingBot, LongPollingSingleThreadUpdateConsumer {

    private final String botToken;
    private final TelegramClient telegramClient;

    public ChuvaBot(@Value("${telegram.bot.token}") String botToken) {
        this.botToken = botToken;
        this.telegramClient = new OkHttpTelegramClient(botToken);
    }

    @Override
    public String getBotToken() {
        return botToken;
    }

    @Override
    public LongPollingUpdateConsumer getUpdatesConsumer() {
        return this;
    }

    @Override
    public void consume(Update update) {
        // TODO: route commands to handlers
        // /start     → StartHandler
        // /login     → LoginHandler
        // /help      → HelpHandler
        // /my_projects  → MyProjectsHandler
        // /my_tasks     → MyTasksHandler
        // /task {id}    → TaskHandler
        // /task_status {id} {status} → TaskStatusHandler
        // /comment {id} {text}       → CommentHandler
        log.debug("Received update: {}", update.getUpdateId());
    }
}
