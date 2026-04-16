package com.springboot.MyTodoList.project;

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
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Tag(name = "Projects")
@SecurityRequirement(name = "bearerAuth")
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @Operation(summary = "Create a project")
    public ResponseEntity<ProjectResponse> create(@Valid @RequestBody ProjectRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(uid(auth), request));
    }

    @GetMapping
    @Operation(summary = "List my projects")
    public ResponseEntity<PagedResponse<ProjectResponse>> listMine(Pageable pageable, Authentication auth) {
        return ResponseEntity.ok(projectService.getMyProjects(uid(auth), pageable));
    }

    @GetMapping("/{projectId}")
    @Operation(summary = "Get project by ID")
    public ResponseEntity<ProjectResponse> getOne(@PathVariable Long projectId, Authentication auth) {
        return ResponseEntity.ok(projectService.getProject(uid(auth), projectId));
    }

    @PutMapping("/{projectId}")
    @Operation(summary = "Update a project")
    public ResponseEntity<ProjectResponse> update(@PathVariable Long projectId,
                                                   @Valid @RequestBody ProjectRequest request,
                                                   Authentication auth) {
        return ResponseEntity.ok(projectService.updateProject(uid(auth), projectId, request));
    }

    @DeleteMapping("/{projectId}")
    @Operation(summary = "Delete a project")
    public ResponseEntity<Void> delete(@PathVariable Long projectId, Authentication auth) {
        projectService.deleteProject(uid(auth), projectId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{projectId}/close")
    @Operation(summary = "Close a project")
    public ResponseEntity<CloseProjectResponse> close(@PathVariable Long projectId, Authentication auth) {
        return ResponseEntity.ok(projectService.closeProject(uid(auth), projectId));
    }

    @PostMapping("/{projectId}/transfer")
    @Operation(summary = "Transfer project ownership")
    public ResponseEntity<ProjectResponse> transfer(@PathVariable Long projectId,
                                                     @Valid @RequestBody TransferRequest request,
                                                     Authentication auth) {
        return ResponseEntity.ok(projectService.transferProject(uid(auth), projectId, request));
    }

    private Long uid(Authentication auth) {
        return Long.parseLong(auth.getName());
    }
}
