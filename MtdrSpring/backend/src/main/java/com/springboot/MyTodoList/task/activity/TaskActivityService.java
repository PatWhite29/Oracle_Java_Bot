package com.springboot.MyTodoList.task.activity;

import com.springboot.MyTodoList.common.PagedResponse;
import com.springboot.MyTodoList.common.enums.ActivityType;
import com.springboot.MyTodoList.project.Project;
import com.springboot.MyTodoList.project.ProjectService;
import com.springboot.MyTodoList.task.Task;
import com.springboot.MyTodoList.task.TaskService;
import com.springboot.MyTodoList.user.User;
import com.springboot.MyTodoList.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TaskActivityService {

    private final TaskActivityRepository activityRepository;
    private final TaskService taskService;
    private final ProjectService projectService;
    private final UserService userService;
    private final TaskActivityMapper activityMapper;

    @Transactional
    public TaskActivityResponse addComment(Long userId, Long projectId, Long taskId, CommentRequest request) {
        User actor = userService.findActiveUserById(userId);
        Project project = projectService.findProject(projectId);
        projectService.requireParticipant(userId, project);
        Task task = taskService.findTask(taskId, project);

        TaskActivity activity = TaskActivity.builder()
                .task(task)
                .employee(actor)
                .activityType(ActivityType.COMMENT)
                .content(request.getContent())
                .build();
        activityRepository.save(activity);
        return activityMapper.toResponse(activity);
    }

    @Transactional(readOnly = true)
    public PagedResponse<TaskActivityResponse> listActivity(Long userId, Long projectId, Long taskId, Pageable pageable) {
        Project project = projectService.findProject(projectId);
        projectService.requireParticipant(userId, project);
        Task task = taskService.findTask(taskId, project);
        return PagedResponse.of(
                activityRepository.findByTaskOrderByCreatedAtDesc(task, pageable)
                        .map(activityMapper::toResponse)
        );
    }
}
