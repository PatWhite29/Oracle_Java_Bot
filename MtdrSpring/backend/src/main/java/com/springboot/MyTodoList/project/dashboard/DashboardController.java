package com.springboot.MyTodoList.project.dashboard;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/sprint-summary")
    @Operation(summary = "Sprint summary — uses active sprint if sprintId is omitted")
    public ResponseEntity<SprintSummaryResponse> sprintSummary(@PathVariable Long projectId,
                                                                @RequestParam(required = false) Long sprintId,
                                                                Authentication auth) {
        return ResponseEntity.ok(dashboardService.getSprintSummary(uid(auth), projectId, sprintId));
    }

    @GetMapping("/velocity")
    @Operation(summary = "SP completed per closed sprint for the last N sprints, oldest to newest")
    public ResponseEntity<List<VelocityResponse>> velocity(@PathVariable Long projectId,
                                                            @RequestParam(defaultValue = "5") int sprints,
                                                            Authentication auth) {
        return ResponseEntity.ok(dashboardService.getVelocity(uid(auth), projectId, sprints));
    }

    @GetMapping("/efficiency")
    @Operation(summary = "Per-member efficiency — uses active sprint if sprintId is omitted")
    public ResponseEntity<EfficiencyResponse> efficiency(@PathVariable Long projectId,
                                                          @RequestParam(required = false) Long sprintId,
                                                          Authentication auth) {
        return ResponseEntity.ok(dashboardService.getEfficiency(uid(auth), projectId, sprintId));
    }

    @GetMapping("/workload")
    @Operation(summary = "Workload per member — uses active sprint if sprintId is omitted")
    public ResponseEntity<List<WorkloadResponse>> workload(@PathVariable Long projectId,
                                                            @RequestParam(required = false) Long sprintId,
                                                            Authentication auth) {
        return ResponseEntity.ok(dashboardService.getWorkload(uid(auth), projectId, sprintId));
    }

    @GetMapping("/backlog")
    @Operation(summary = "Backlog summary: total tasks, total SP, distribution by priority")
    public ResponseEntity<BacklogResponse> backlog(@PathVariable Long projectId, Authentication auth) {
        return ResponseEntity.ok(dashboardService.getBacklog(uid(auth), projectId));
    }

    @GetMapping("/burndown")
    @Operation(summary = "Burndown for the active sprint (or a specific sprint via sprintId)")
    public ResponseEntity<BurndownResponse> burndown(@PathVariable Long projectId,
                                                      @RequestParam(required = false) Long sprintId,
                                                      Authentication auth) {
        return ResponseEntity.ok(dashboardService.getBurndown(uid(auth), projectId, sprintId));
    }

    private Long uid(Authentication auth) {
        return Long.parseLong(auth.getName());
    }
}
