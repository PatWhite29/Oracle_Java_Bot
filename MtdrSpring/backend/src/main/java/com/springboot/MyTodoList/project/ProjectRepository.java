package com.springboot.MyTodoList.project;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("""
            SELECT p FROM Project p
            WHERE p.manager.id = :userId
            OR p.id IN (
                SELECT pm.project.id FROM ProjectMember pm WHERE pm.employee.id = :userId
            )
            """)
    Page<Project> findAllByParticipant(@Param("userId") Long userId, Pageable pageable);
}
