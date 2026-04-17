package com.springboot.MyTodoList.task;

import com.springboot.MyTodoList.common.PagedResponse;
import com.springboot.MyTodoList.common.enums.TaskPriority;
import com.springboot.MyTodoList.common.enums.TaskStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    @Operation(summary = "Create a task")
    public ResponseEntity<TaskResponse> create(@PathVariable Long projectId,
                                                @Valid @RequestBody TaskRequest request,
                                                Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.createTask(uid(auth), projectId, request));
    }

    @GetMapping
    @Operation(summary = "List tasks with optional filters")
    public ResponseEntity<PagedResponse<TaskResponse>> list(
            @PathVariable Long projectId,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) Long sprint,
            @RequestParam(required = false) Long assigned_to,
            @RequestParam(required = false) TaskPriority priority,
            Pageable pageable,
            Authentication auth) {
        return ResponseEntity.ok(
                taskService.listTasks(uid(auth), projectId, status, sprint, assigned_to, priority, pageable));
    }

    @GetMapping("/{taskId}")
    @Operation(summary = "Get task by ID")
    public ResponseEntity<TaskResponse> getOne(@PathVariable Long projectId,
                                                @PathVariable Long taskId,
                                                Authentication auth) {
        return ResponseEntity.ok(taskService.getTask(uid(auth), projectId, taskId));
    }

    @PutMapping("/{taskId}")
    @Operation(summary = "Update a task")
    public ResponseEntity<TaskResponse> update(@PathVariable Long projectId,
                                                @PathVariable Long taskId,
                                                @Valid @RequestBody TaskRequest request,
                                                Authentication auth) {
        return ResponseEntity.ok(taskService.updateTask(uid(auth), projectId, taskId, request));
    }

    @DeleteMapping("/{taskId}")
    @Operation(summary = "Delete a task")
    public ResponseEntity<Void> delete(@PathVariable Long projectId,
                                        @PathVariable Long taskId,
                                        Authentication auth) {
        taskService.deleteTask(uid(auth), projectId, taskId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{taskId}/status")
    @Operation(summary = "Change task status — PATCH /api/v1/projects/{projectId}/tasks/{taskId}/status")
    public ResponseEntity<TaskResponse> changeStatus(@PathVariable Long projectId,
                                                      @PathVariable Long taskId,
                                                      @Valid @RequestBody StatusChangeRequest request,
                                                      Authentication auth) {
        return ResponseEntity.ok(taskService.changeStatus(uid(auth), projectId, taskId, request));
    }

    @PatchMapping("/{taskId}/sprint")
    @Operation(summary = "Move task to sprint or backlog — PATCH /api/v1/projects/{projectId}/tasks/{taskId}/sprint")
    public ResponseEntity<TaskResponse> changeSprint(@PathVariable Long projectId,
                                                      @PathVariable Long taskId,
                                                      @RequestBody SprintChangeRequest request,
                                                      Authentication auth) {
        return ResponseEntity.ok(taskService.changeSprint(uid(auth), projectId, taskId, request));
    }

    private Long uid(Authentication auth) {
        return Long.parseLong(auth.getName());
    }
}
