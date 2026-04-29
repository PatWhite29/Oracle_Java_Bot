package com.springboot.MyTodoList.sprint;

import com.springboot.MyTodoList.common.enums.SprintStatus;
import com.springboot.MyTodoList.project.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SprintRepository extends JpaRepository<Sprint, Long> {
    Page<Sprint> findByProject(Project project, Pageable pageable);
    List<Sprint> findByProjectAndStatus(Project project, SprintStatus status);
    boolean existsByProjectAndStatus(Project project, SprintStatus status);
    void deleteByProject(Project project);
}
