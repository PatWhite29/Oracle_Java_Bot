package com.springboot.MyTodoList.sprint;

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
@RequestMapping("/api/v1/projects/{projectId}/sprints")
@RequiredArgsConstructor
@Tag(name = "Sprints")
@SecurityRequirement(name = "bearerAuth")
public class SprintController {

    private final SprintService sprintService;

    @PostMapping
    @Operation(summary = "Create a sprint")
    public ResponseEntity<SprintResponse> create(@PathVariable Long projectId,
                                                  @Valid @RequestBody SprintRequest request,
                                                  Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sprintService.createSprint(uid(auth), projectId, request));
    }

    @GetMapping
    @Operation(summary = "List sprints")
    public ResponseEntity<PagedResponse<SprintResponse>> list(@PathVariable Long projectId,
                                                               Pageable pageable,
                                                               Authentication auth) {
        return ResponseEntity.ok(sprintService.listSprints(uid(auth), projectId, pageable));
    }

    @GetMapping("/{sprintId}")
    @Operation(summary = "Get sprint by ID")
    public ResponseEntity<SprintResponse> getOne(@PathVariable Long projectId,
                                                  @PathVariable Long sprintId,
                                                  Authentication auth) {
        return ResponseEntity.ok(sprintService.getSprint(uid(auth), projectId, sprintId));
    }

    @PutMapping("/{sprintId}")
    @Operation(summary = "Update a sprint")
    public ResponseEntity<SprintResponse> update(@PathVariable Long projectId,
                                                  @PathVariable Long sprintId,
                                                  @Valid @RequestBody SprintRequest request,
                                                  Authentication auth) {
        return ResponseEntity.ok(sprintService.updateSprint(uid(auth), projectId, sprintId, request));
    }

    @PostMapping("/{sprintId}/activate")
    @Operation(summary = "Activate a sprint")
    public ResponseEntity<SprintResponse> activate(@PathVariable Long projectId,
                                                    @PathVariable Long sprintId,
                                                    Authentication auth) {
        return ResponseEntity.ok(sprintService.activateSprint(uid(auth), projectId, sprintId));
    }

    @PostMapping("/{sprintId}/close")
    @Operation(summary = "Close a sprint")
    public ResponseEntity<SprintResponse> close(@PathVariable Long projectId,
                                                 @PathVariable Long sprintId,
                                                 Authentication auth) {
        return ResponseEntity.ok(sprintService.closeSprint(uid(auth), projectId, sprintId));
    }

    @PostMapping("/{sprintId}/reopen")
    @Operation(summary = "Reopen a closed sprint (back to PLANNING)")
    public ResponseEntity<SprintResponse> reopen(@PathVariable Long projectId,
                                                  @PathVariable Long sprintId,
                                                  Authentication auth) {
        return ResponseEntity.ok(sprintService.reopenSprint(uid(auth), projectId, sprintId));
    }

    @DeleteMapping("/{sprintId}")
    @Operation(summary = "Delete a sprint — moves its tasks to backlog; ACTIVE sprints cannot be deleted")
    public ResponseEntity<Void> delete(@PathVariable Long projectId,
                                        @PathVariable Long sprintId,
                                        Authentication auth) {
        sprintService.deleteSprint(uid(auth), projectId, sprintId);
        return ResponseEntity.noContent().build();
    }

    private Long uid(Authentication auth) {
        return Long.parseLong(auth.getName());
    }
}
