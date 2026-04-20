package com.springboot.MyTodoList.notification;

import com.springboot.MyTodoList.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    List<NotificationLog> findByRecipientAndDeliveryStatus(User recipient, String deliveryStatus);
    List<NotificationLog> findByDeliveryStatus(String deliveryStatus);
    Page<NotificationLog> findByRecipient(User recipient, Pageable pageable);
}
