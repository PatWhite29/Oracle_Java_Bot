package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.dto.analytics.DeveloperSprintMetricDTO;
import com.springboot.MyTodoList.model.Task;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    @Query("select new com.springboot.MyTodoList.dto.analytics.DeveloperSprintMetricDTO(" +
            "p.id, " +
            "p.projectName, " +
            "case when s.id is null then null else s.id end, " +
            "case when s.id is null then 'Backlog' else s.sprintName end, " +
            "u.id, " +
            "u.fullName, " +
            "count(t.id), " +
            "coalesce(sum(case when t.status = com.springboot.MyTodoList.model.TaskStatus.DONE then 1 else 0 end), 0), " +
            "coalesce(sum(case when t.realHours is null then 0 else t.realHours end), 0), " +
            "coalesce(sum(case when t.status = com.springboot.MyTodoList.model.TaskStatus.BLOCKED then 1 else 0 end), 0), " +
            "coalesce(sum(case when t.storyPoints is null then 0 else t.storyPoints end), 0)) " +
            "from Task t " +
            "join t.project p " +
            "left join t.sprint s " +
            "join t.assignedTo u " +
            "where p.id = :projectId " +
            "and (:sprintId is null or s.id = :sprintId) " +
            "group by p.id, p.projectName, s.id, s.sprintName, u.id, u.fullName " +
            "order by case when s.startDate is null then 1 else 0 end, s.startDate, u.fullName")
    List<DeveloperSprintMetricDTO> findDeveloperSprintMetrics(@Param("projectId") Long projectId,
                                                              @Param("sprintId") Long sprintId);
}