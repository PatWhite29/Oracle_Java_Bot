package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.dto.analytics.AnalyticsInsightsDto;
import com.springboot.MyTodoList.dto.analytics.AnalyticsSummaryDTO;
import com.springboot.MyTodoList.dto.analytics.DeveloperSprintMetricDTO;
import com.springboot.MyTodoList.service.analytics.AnalyticsService;
import com.springboot.MyTodoList.service.analytics.CurrentUserResolver;
import java.util.List;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects/{projectId}/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final CurrentUserResolver currentUserResolver;

    public AnalyticsController(AnalyticsService analyticsService, CurrentUserResolver currentUserResolver) {
        this.analyticsService = analyticsService;
        this.currentUserResolver = currentUserResolver;
    }

    @GetMapping("/tasks-completed-by-user-sprint")
    public List<DeveloperSprintMetricDTO> getTasksCompletedByUserSprint(@PathVariable Long projectId,
                                                                        @RequestParam(required = false) Long sprintId,
                                                                        HttpServletRequest request) {
        Long userId = currentUserResolver.resolveUserId(request);
        return analyticsService.getMetrics(projectId, sprintId, userId);
    }

    @GetMapping("/real-hours-by-user-sprint")
    public List<DeveloperSprintMetricDTO> getRealHoursByUserSprint(@PathVariable Long projectId,
                                                                   @RequestParam(required = false) Long sprintId,
                                                                   HttpServletRequest request) {
        Long userId = currentUserResolver.resolveUserId(request);
        return analyticsService.getMetrics(projectId, sprintId, userId);
    }

    @GetMapping("/insights")
    public AnalyticsInsightsDto getInsights(@PathVariable Long projectId,
                                            @RequestParam(required = false) Long sprintId,
                                            HttpServletRequest request) {
        Long userId = currentUserResolver.resolveUserId(request);
        return analyticsService.buildInsights(projectId, sprintId, userId);
    }

    @GetMapping("/summary")
    public AnalyticsSummaryDTO getSummary(@PathVariable Long projectId,
                                          @RequestParam(required = false) Long sprintId,
                                          HttpServletRequest request) {
        Long userId = currentUserResolver.resolveUserId(request);
        return analyticsService.buildSummary(projectId, sprintId, userId);
    }
}
