package com.springboot.MyTodoList.audit;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot.MyTodoList.common.enums.AuditAction;
import com.springboot.MyTodoList.common.enums.EntityType;
import com.springboot.MyTodoList.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public void log(User actor, EntityType entityType, Long entityId,
                    AuditAction action, Object oldValue, Object newValue) {
        AuditLog entry = AuditLog.builder()
                .employee(actor)
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .oldValue(toJson(oldValue))
                .newValue(toJson(newValue))
                .build();
        auditLogRepository.save(entry);
    }

    private String toJson(Object value) {
        if (value == null) return null;
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize audit value: {}", e.getMessage());
            return value.toString();
        }
    }
}
