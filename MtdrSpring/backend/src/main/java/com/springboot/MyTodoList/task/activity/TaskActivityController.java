package com.springboot.MyTodoList.task.activity;

import com.springboot.MyTodoList.common.PagedResponse;
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
@RequestMapping("/api/v1/projects/{projectId}/tasks/{taskId}")
@RequiredArgsConstructor
@Tag(name = "Task Activity")
@SecurityRequirement(name = "bearerAuth")
public class TaskActivityController {

    private final TaskActivityService activityService;

    @PostMapping("/comments")
    @Operation(summary = "Add a comment to a task")
    public ResponseEntity<TaskActivityResponse> comment(@PathVariable Long projectId,
                                                         @PathVariable Long taskId,
                                                         @Valid @RequestBody CommentRequest request,
                                                         Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(activityService.addComment(uid(auth), projectId, taskId, request));
    }

    @GetMapping("/activity")
    @Operation(summary = "List all task activity")
    public ResponseEntity<PagedResponse<TaskActivityResponse>> activity(@PathVariable Long projectId,
                                                                          @PathVariable Long taskId,
                                                                          Pageable pageable,
                                                                          Authentication auth) {
        return ResponseEntity.ok(activityService.listActivity(uid(auth), projectId, taskId, pageable));
    }

    private Long uid(Authentication auth) {
        return Long.parseLong(auth.getName());
    }
}
