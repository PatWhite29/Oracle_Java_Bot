package com.springboot.MyTodoList.telegram;

import com.springboot.MyTodoList.telegram.handler.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.longpolling.interfaces.LongPollingUpdateConsumer;
import org.telegram.telegrambots.longpolling.starter.SpringLongPollingBot;
import org.telegram.telegrambots.longpolling.util.LongPollingSingleThreadUpdateConsumer;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.meta.generics.TelegramClient;

@Component
@ConditionalOnExpression("!'${telegram.bot.token:}'.isEmpty()")
@Slf4j
public class ChuvaBot implements SpringLongPollingBot, LongPollingSingleThreadUpdateConsumer {

    private final String botToken;
    private final TelegramClient telegramClient;
    private final StartHandler startHandler;
    private final LoginHandler loginHandler;
    private final HelpHandler helpHandler;
    private final MyProjectsHandler myProjectsHandler;
    private final MyTasksHandler myTasksHandler;
    private final TaskHandler taskHandler;
    private final TaskStatusHandler taskStatusHandler;
    private final CommentHandler commentHandler;

    public ChuvaBot(
            @Value("${telegram.bot.token}") String botToken,
            TelegramClient telegramClient,
            StartHandler startHandler,
            LoginHandler loginHandler,
            HelpHandler helpHandler,
            MyProjectsHandler myProjectsHandler,
            MyTasksHandler myTasksHandler,
            TaskHandler taskHandler,
            TaskStatusHandler taskStatusHandler,
            CommentHandler commentHandler) {
        this.botToken = botToken;
        this.telegramClient = telegramClient;
        this.startHandler = startHandler;
        this.loginHandler = loginHandler;
        this.helpHandler = helpHandler;
        this.myProjectsHandler = myProjectsHandler;
        this.myTasksHandler = myTasksHandler;
        this.taskHandler = taskHandler;
        this.taskStatusHandler = taskStatusHandler;
        this.commentHandler = commentHandler;
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
        if (!update.hasMessage() || !update.getMessage().hasText()) return;

        String text = update.getMessage().getText().trim();
        String command = text.split("\\s+")[0].toLowerCase();

        log.debug("Received command '{}' from chatId {}", command, update.getMessage().getChatId());

        switch (command) {
            case "/start"       -> startHandler.handle(update, telegramClient);
            case "/login"       -> loginHandler.handle(update, telegramClient);
            case "/help"        -> helpHandler.handle(update, telegramClient);
            case "/my_projects" -> myProjectsHandler.handle(update, telegramClient);
            case "/my_tasks"    -> myTasksHandler.handle(update, telegramClient);
            case "/task"        -> taskHandler.handle(update, telegramClient);
            case "/task_status" -> taskStatusHandler.handle(update, telegramClient);
            case "/comment"     -> commentHandler.handle(update, telegramClient);
            default             -> sendUnknownCommand(update.getMessage().getChatId());
        }
    }

    private void sendUnknownCommand(Long chatId) {
        try {
            telegramClient.execute(SendMessage.builder()
                    .chatId(chatId)
                    .text("Unknown command. Use /help to see available commands.")
                    .build());
        } catch (TelegramApiException e) {
            log.warn("Failed to send unknown-command reply to chatId {}: {}", chatId, e.getMessage());
        }
    }
}
