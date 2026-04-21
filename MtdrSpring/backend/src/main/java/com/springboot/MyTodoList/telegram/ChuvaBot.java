package com.springboot.MyTodoList.telegram;

import com.springboot.MyTodoList.telegram.handler.*;
import com.springboot.MyTodoList.telegram.SyntheticUpdateFactory;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import com.springboot.MyTodoList.telegram.nlu.NluErrorMessages;
import com.springboot.MyTodoList.telegram.nlu.NluResult;
import com.springboot.MyTodoList.telegram.nlu.NluStatus;
import com.springboot.MyTodoList.telegram.nlu.NaturalLanguageRouter;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final NaturalLanguageRouter nluRouter;
    private final ObjectMapper objectMapper;

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
            CommentHandler commentHandler,
            NaturalLanguageRouter nluRouter,
            ObjectMapper objectMapper) {
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
        this.nluRouter = nluRouter;
        this.objectMapper = objectMapper;
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
        Long chatId = update.getMessage().getChatId();

        if (text.startsWith("/")) {
            String command = text.split("\\s+")[0].toLowerCase();
            log.debug("Received command '{}' from chatId {}", command, chatId);
            routeCommand(command, update);
        } else {
            log.debug("Received NL message from chatId {}, classifying...", chatId);
            handleNaturalLanguage(text, update, chatId);
        }
    }

    private void routeCommand(String command, Update update) {
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

    private void handleNaturalLanguage(String text, Update update, Long chatId) {
        NluResult result = nluRouter.classify(text);

        if (result.getStatus() == NluStatus.OK) {
            List<String> invalidParams = validateNluParams(result);
            if (!invalidParams.isEmpty()) {
                String message = NluErrorMessages.getErrorMessage(result.getCommand(), invalidParams);
                TelegramHelper.send(telegramClient, chatId, message);
                return;
            }
            String syntheticText = buildSyntheticCommand(result);
            log.debug("NLU mapped to command '{}' for chatId {}", result.getCommand(), chatId);
            Update syntheticUpdate = SyntheticUpdateFactory.withText(update, syntheticText, objectMapper);
            routeCommand("/" + result.getCommand(), syntheticUpdate);
        } else if (result.getStatus() == NluStatus.MISSING_PARAMS) {
            String message = NluErrorMessages.getErrorMessage(result.getCommand(), result.getMissing());
            TelegramHelper.send(telegramClient, chatId, message);
        } else {
            TelegramHelper.send(telegramClient, chatId,
                    "No entendí tu mensaje. Escribe /help para ver los comandos disponibles.");
        }
    }

    private String buildSyntheticCommand(NluResult result) {
        StringBuilder sb = new StringBuilder("/").append(result.getCommand());
        if (result.getParams() != null) {
            switch (result.getCommand()) {
                case "task"        -> appendParam(sb, result, "id");
                case "task_status" -> {
                    appendParam(sb, result, "id");
                    appendParam(sb, result, "status");
                    appendParam(sb, result, "hours");
                }
                case "comment"     -> {
                    appendParam(sb, result, "id");
                    appendParam(sb, result, "text");
                }
            }
        }
        return sb.toString();
    }

    private List<String> validateNluParams(NluResult result) {
        List<String> invalid = new ArrayList<>();
        Map<String, String> params = result.getParams();
        if (params == null) return invalid;
        if (List.of("task", "task_status", "comment").contains(result.getCommand())) {
            String id = params.get("id");
            if (id != null && !id.matches("\\d+")) invalid.add("id");
        }
        return invalid;
    }

    private void appendParam(StringBuilder sb, NluResult result, String key) {
        String val = result.getParams().get(key);
        if (val != null && !val.isBlank()) sb.append(" ").append(val);
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
