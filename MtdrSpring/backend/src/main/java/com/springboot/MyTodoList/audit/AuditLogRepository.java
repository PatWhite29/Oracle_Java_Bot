package com.springboot.MyTodoList.audit;

import com.springboot.MyTodoList.common.enums.EntityType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByEntityTypeAndEntityId(EntityType entityType, Long entityId);
}
