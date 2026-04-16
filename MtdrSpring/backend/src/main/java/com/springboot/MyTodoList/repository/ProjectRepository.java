package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Project;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("select distinct p from Project p where p.manager.id = :userId or exists (select pm.id from ProjectMember pm where pm.project = p and pm.user.id = :userId) order by p.projectName")
    List<Project> findAccessibleProjects(@Param("userId") Long userId);
}