package com.springboot.MyTodoList.notification;

import com.springboot.MyTodoList.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationLogRepository notificationLogRepository;

    public void send(User recipient, String eventType, String message) {
        NotificationLog entry = NotificationLog.builder()
                .recipient(recipient)
                .eventType(eventType)
                .channel("TELEGRAM")
                .message(message)
                .deliveryStatus("FAILED")
                .build();
        try {
            // TODO: integrate with ChuvaBot to send Telegram message when bot is available
            if (recipient.getTelegramChatId() != null) {
                entry.setDeliveryStatus("SENT");
            }
        } catch (Exception e) {
            log.warn("Notification delivery failed for user {}: {}", recipient.getId(), e.getMessage());
        }
        notificationLogRepository.save(entry);
    }

    public void retryFailed() {
        // TODO: retry logic — query FAILED notifications and retry delivery
    }
}
