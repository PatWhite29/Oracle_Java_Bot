package com.springboot.MyTodoList.notification;

import com.springboot.MyTodoList.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.meta.generics.TelegramClient;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationLogRepository notificationLogRepository;

    // Optional — only present when TELEGRAM_BOT_TOKEN is configured
    @Autowired(required = false)
    private TelegramClient telegramClient;

    public void send(User recipient, String eventType, String message) {
        String status = attemptSend(recipient, message);
        notificationLogRepository.save(NotificationLog.builder()
                .recipient(recipient)
                .eventType(eventType)
                .channel("TELEGRAM")
                .message(message)
                .deliveryStatus(status)
                .build());
    }

    public void retryFailed() {
        List<NotificationLog> failed = notificationLogRepository.findByDeliveryStatus("FAILED");
        if (failed.isEmpty()) return;

        log.info("Retrying {} failed notification(s)", failed.size());
        for (NotificationLog entry : failed) {
            String status = attemptSend(entry.getRecipient(), entry.getMessage());
            entry.setDeliveryStatus(status);
        }
        notificationLogRepository.saveAll(failed);
    }

    private String attemptSend(User recipient, String message) {
        Long chatId = recipient.getTelegramChatId();
        if (chatId == null) {
            log.debug("Skipping notification for user {} — no Telegram chatId linked", recipient.getId());
            return "FAILED";
        }
        if (telegramClient == null) {
            log.debug("Skipping notification — Telegram bot not configured");
            return "FAILED";
        }
        try {
            telegramClient.execute(SendMessage.builder()
                    .chatId(chatId)
                    .text(message)
                    .build());
            return "SENT";
        } catch (TelegramApiException e) {
            log.warn("Telegram delivery failed for user {} (chatId {}): {}", recipient.getId(), chatId, e.getMessage());
            return "FAILED";
        }
    }
}
