package com.springboot.MyTodoList.task.activity;

import com.springboot.MyTodoList.task.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskActivityRepository extends JpaRepository<TaskActivity, Long> {
    Page<TaskActivity> findByTaskOrderByCreatedAtDesc(Task task, Pageable pageable);
    void deleteByTask(Task task);
    void deleteByTask_Project(com.springboot.MyTodoList.project.Project project);
}
