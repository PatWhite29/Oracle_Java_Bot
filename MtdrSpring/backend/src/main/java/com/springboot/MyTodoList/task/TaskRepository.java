package com.springboot.MyTodoList.task;

import com.springboot.MyTodoList.common.enums.TaskPriority;
import com.springboot.MyTodoList.common.enums.TaskStatus;
import com.springboot.MyTodoList.project.Project;
import com.springboot.MyTodoList.sprint.Sprint;
import com.springboot.MyTodoList.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    @Query("""
            SELECT t FROM Task t
            WHERE t.project = :project
            AND (:status IS NULL OR t.status = :status)
            AND (:sprint IS NULL OR t.sprint = :sprint)
            AND (:assignedTo IS NULL OR t.assignedTo = :assignedTo)
            AND (:priority IS NULL OR t.priority = :priority)
            """)
    Page<Task> findByProjectWithFilters(
            @Param("project") Project project,
            @Param("status") TaskStatus status,
            @Param("sprint") Sprint sprint,
            @Param("assignedTo") User assignedTo,
            @Param("priority") TaskPriority priority,
            Pageable pageable
    );

    List<Task> findBySprintAndStatusNot(Sprint sprint, TaskStatus status);

    List<Task> findByProject(Project project);

    List<Task> findByProjectAndSprintIsNull(Project project);

    @Query("""
            SELECT t FROM Task t
            WHERE t.assignedTo = :assignedTo
            AND (t.sprint IS NULL OR t.sprint.status <> com.springboot.MyTodoList.common.enums.SprintStatus.CLOSED)
            """)
    List<Task> findActiveTasksByAssignedTo(@Param("assignedTo") User assignedTo);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.sprint = :sprint AND t.status = :status")
    long countBySprintAndStatus(@Param("sprint") Sprint sprint, @Param("status") TaskStatus status);

    @Query("SELECT SUM(t.storyPoints) FROM Task t WHERE t.sprint = :sprint AND t.status = :status")
    Long sumStoryPointsBySprintAndStatus(@Param("sprint") Sprint sprint, @Param("status") TaskStatus status);

    @Query("SELECT SUM(t.storyPoints) FROM Task t WHERE t.sprint = :sprint")
    Long sumStoryPointsBySprint(@Param("sprint") Sprint sprint);

    // Dashboard aggregations — avoids loading full entity lists

    @Query("SELECT t.status, COUNT(t), SUM(t.storyPoints) FROM Task t WHERE t.sprint = :sprint GROUP BY t.status")
    List<Object[]> findStatusCountsAndSpBySprint(@Param("sprint") Sprint sprint);

    @Query("""
            SELECT t.assignedTo.id, t.assignedTo.fullName, t.status, COUNT(t), SUM(t.storyPoints)
            FROM Task t
            WHERE t.sprint = :sprint AND t.assignedTo IS NOT NULL
            GROUP BY t.assignedTo.id, t.assignedTo.fullName, t.status
            """)
    List<Object[]> findWorkloadBySprint(@Param("sprint") Sprint sprint);

    @Query("""
            SELECT t.assignedTo.id, t.assignedTo.fullName, SUM(t.storyPoints), SUM(t.actualHours)
            FROM Task t
            WHERE t.sprint = :sprint AND t.status = :status AND t.assignedTo IS NOT NULL
            GROUP BY t.assignedTo.id, t.assignedTo.fullName
            """)
    List<Object[]> findEfficiencyBySprint(@Param("sprint") Sprint sprint, @Param("status") TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project = :project AND t.sprint IS NULL")
    long countBacklogByProject(@Param("project") Project project);

    @Query("SELECT SUM(t.storyPoints) FROM Task t WHERE t.project = :project AND t.sprint IS NULL")
    Long sumBacklogSpByProject(@Param("project") Project project);

    @Query("SELECT t.priority, COUNT(t) FROM Task t WHERE t.project = :project AND t.sprint IS NULL GROUP BY t.priority")
    List<Object[]> findBacklogPriorityCountsByProject(@Param("project") Project project);
}
