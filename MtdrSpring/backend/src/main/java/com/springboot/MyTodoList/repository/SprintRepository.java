package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Sprint;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {

    List<Sprint> findByProject_IdOrderByStartDateAsc(Long projectId);
}