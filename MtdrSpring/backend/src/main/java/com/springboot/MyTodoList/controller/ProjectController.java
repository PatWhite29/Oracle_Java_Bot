package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.dto.analytics.ProjectOptionDTO;
import com.springboot.MyTodoList.service.analytics.AnalyticsService;
import com.springboot.MyTodoList.service.analytics.CurrentUserResolver;
import java.util.List;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final AnalyticsService analyticsService;
    private final CurrentUserResolver currentUserResolver;

    public ProjectController(AnalyticsService analyticsService, CurrentUserResolver currentUserResolver) {
        this.analyticsService = analyticsService;
        this.currentUserResolver = currentUserResolver;
    }

    @GetMapping("/accessible")
    public List<ProjectOptionDTO> getAccessibleProjects(HttpServletRequest request) {
        Long userId = currentUserResolver.resolveUserId(request);
        return analyticsService.getAccessibleProjects(userId);
    }
}