package com.springboot.MyTodoList.project.dashboard;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/sprint-summary")
    @Operation(summary = "Active sprint summary")
    public ResponseEntity<SprintSummaryResponse> sprintSummary(@PathVariable Long projectId, Authentication auth) {
        return ResponseEntity.ok(dashboardService.getSprintSummary(uid(auth), projectId));
    }

    @GetMapping("/velocity")
    @Operation(summary = "Velocity trend for last N closed sprints")
    public ResponseEntity<VelocityResponse> velocity(@PathVariable Long projectId,
                                                      @RequestParam(defaultValue = "5") int sprints,
                                                      Authentication auth) {
        return ResponseEntity.ok(dashboardService.getVelocity(uid(auth), projectId, sprints));
    }

    @GetMapping("/burndown")
    @Operation(summary = "Burndown of active sprint")
    public ResponseEntity<BurndownResponse> burndown(@PathVariable Long projectId, Authentication auth) {
        return ResponseEntity.ok(dashboardService.getBurndown(uid(auth), projectId));
    }

    @GetMapping("/workload")
    @Operation(summary = "Workload per member")
    public ResponseEntity<WorkloadResponse> workload(@PathVariable Long projectId, Authentication auth) {
        return ResponseEntity.ok(dashboardService.getWorkload(uid(auth), projectId));
    }

    @GetMapping("/backlog")
    @Operation(summary = "Backlog summary")
    public ResponseEntity<BacklogResponse> backlog(@PathVariable Long projectId, Authentication auth) {
        return ResponseEntity.ok(dashboardService.getBacklog(uid(auth), projectId));
    }

    private Long uid(Authentication auth) {
        return Long.parseLong(auth.getName());
    }
}
