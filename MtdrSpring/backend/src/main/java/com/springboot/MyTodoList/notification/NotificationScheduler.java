package com.springboot.MyTodoList.notification;

import com.springboot.MyTodoList.common.enums.SprintStatus;
import com.springboot.MyTodoList.common.enums.TaskStatus;
import com.springboot.MyTodoList.sprint.Sprint;
import com.springboot.MyTodoList.sprint.SprintRepository;
import com.springboot.MyTodoList.task.Task;
import com.springboot.MyTodoList.task.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

    private final SprintRepository sprintRepository;
    private final TaskRepository taskRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 9 * * *")
    public void notifyApproachingSprintDeadlines() {
        LocalDate threeDaysFromNow = LocalDate.now().plusDays(3);
        // Find all ACTIVE sprints ending within 3 days
        sprintRepository.findAll().stream()
                .filter(s -> s.getStatus() == SprintStatus.ACTIVE)
                .filter(s -> !s.getEndDate().isBefore(LocalDate.now()))
                .filter(s -> !s.getEndDate().isAfter(threeDaysFromNow))
                .forEach(this::notifySprintDeadline);
    }

    @Scheduled(cron = "0 0 9 * * *")
    public void retryFailedNotifications() {
        notificationService.retryFailed();
    }

    private void notifySprintDeadline(Sprint sprint) {
        List<Task> incompleteTasks = taskRepository.findBySprintAndStatusNot(sprint, TaskStatus.DONE);
        if (incompleteTasks.isEmpty()) return;

        String message = String.format(
                "Sprint '%s' ends on %s. %d task(s) are not yet DONE.",
                sprint.getSprintName(), sprint.getEndDate(), incompleteTasks.size());

        notificationService.send(sprint.getProject().getManager(), "SPRINT_DEADLINE", message);

        incompleteTasks.stream()
                .filter(t -> t.getAssignedTo() != null)
                .map(Task::getAssignedTo)
                .distinct()
                .forEach(member -> notificationService.send(member, "SPRINT_DEADLINE", message));
    }
}
