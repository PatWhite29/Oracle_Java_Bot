package com.springboot.MyTodoList.notification;

import com.springboot.MyTodoList.TestFixtures;
import com.springboot.MyTodoList.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.generics.TelegramClient;

import java.lang.reflect.Field;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class NotificationServiceTest {

    @Mock TelegramClient telegramClient;
    @Mock NotificationLogRepository notificationLogRepository;

    NotificationService notificationService;

    @BeforeEach
    void setUp() throws Exception {
        notificationService = new NotificationService(notificationLogRepository);
        // telegramClient es @Autowired(required=false) — no está en el constructor de Lombok
        Field field = NotificationService.class.getDeclaredField("telegramClient");
        field.setAccessible(true);
        field.set(notificationService, telegramClient);
    }

    @Test // Test #16
    void send_taskBlocked_sendsMessageToManagerViaTelegram() throws Exception {
        User manager = TestFixtures.user(1L);
        manager.setTelegramChatId(99999L);

        given(notificationLogRepository.save(any())).willAnswer(i -> i.getArgument(0));

        notificationService.send(manager, "TASK_BLOCKED", "Task 'Fix login' was blocked");

        verify(telegramClient).execute(any(SendMessage.class));
        verify(notificationLogRepository).save(any());
    }
}
