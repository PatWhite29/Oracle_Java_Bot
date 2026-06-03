package com.springboot.MyTodoList.bot;

import com.springboot.MyTodoList.TestFixtures;
import com.springboot.MyTodoList.task.TaskService;
import com.springboot.MyTodoList.telegram.handler.TaskStatusHandler;
import com.springboot.MyTodoList.user.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.mockito.Answers;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.generics.TelegramClient;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TaskStatusHandlerTest {

    @Mock UserService userService;
    @Mock TaskService taskService;
    @InjectMocks TaskStatusHandler handler;

    @Test // Test #17
    void handle_invalidStatus_sendsValidStatusListError() throws Exception {
        Long chatId = 12345L;
        // Deep stubs evitan importar la clase Message interna del SDK de Telegram
        Update update = mock(Update.class, Answers.RETURNS_DEEP_STUBS);
        TelegramClient client = mock(TelegramClient.class);

        given(update.getMessage().getChatId()).willReturn(chatId);
        given(update.getMessage().getText()).willReturn("/task_status 200 INVALID_STATUS");
        given(userService.findByTelegramChatId(chatId)).willReturn(TestFixtures.user(1L));

        handler.handle(update, client);

        verify(client).execute(any(SendMessage.class));
    }
}
