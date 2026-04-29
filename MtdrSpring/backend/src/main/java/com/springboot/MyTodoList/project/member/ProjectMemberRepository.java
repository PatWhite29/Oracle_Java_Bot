package com.springboot.MyTodoList.project.member;

import com.springboot.MyTodoList.project.Project;
import com.springboot.MyTodoList.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    Optional<ProjectMember> findByProjectAndEmployee(Project project, User employee);
    boolean existsByProjectAndEmployee(Project project, User employee);
    Page<ProjectMember> findAllByProject(Project project, Pageable pageable);
    List<ProjectMember> findAllByProject(Project project);
    void deleteByProjectAndEmployee(Project project, User employee);
    void deleteByProject(Project project);
}
