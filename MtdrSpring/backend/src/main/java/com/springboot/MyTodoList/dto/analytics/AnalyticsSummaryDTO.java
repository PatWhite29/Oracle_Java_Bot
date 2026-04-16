package com.springboot.MyTodoList.dto.analytics;

import java.util.ArrayList;
import java.util.List;

public class AnalyticsSummaryDTO {

    private Long projectId;
    private String projectName;
    private Long selectedSprintId;
    private String selectedSprintLabel;
    private boolean allSprints;
    private boolean hasBacklog;
    private List<ProjectOptionDTO> accessibleProjects = new ArrayList<ProjectOptionDTO>();
    private List<SprintOptionDTO> sprintOptions = new ArrayList<SprintOptionDTO>();
    private List<DeveloperSprintMetricDTO> taskMetrics = new ArrayList<DeveloperSprintMetricDTO>();
    private List<DeveloperSprintMetricDTO> realHoursMetrics = new ArrayList<DeveloperSprintMetricDTO>();
    private Long totalTasksDone = 0L;
    private Double totalRealHours = 0d;
    private DeveloperPerformanceDTO topTaskPerformer;
    private DeveloperPerformanceDTO topHourPerformer;
    private DeveloperPerformanceDTO bestEfficiency;
    private DeveloperPerformanceDTO mostLoadedDeveloper;
    private List<String> keyFindings = new ArrayList<String>();
    private List<String> recommendations = new ArrayList<String>();

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public Long getSelectedSprintId() {
        return selectedSprintId;
    }

    public void setSelectedSprintId(Long selectedSprintId) {
        this.selectedSprintId = selectedSprintId;
    }

    public String getSelectedSprintLabel() {
        return selectedSprintLabel;
    }

    public void setSelectedSprintLabel(String selectedSprintLabel) {
        this.selectedSprintLabel = selectedSprintLabel;
    }

    public boolean isAllSprints() {
        return allSprints;
    }

    public void setAllSprints(boolean allSprints) {
        this.allSprints = allSprints;
    }

    public boolean isHasBacklog() {
        return hasBacklog;
    }

    public void setHasBacklog(boolean hasBacklog) {
        this.hasBacklog = hasBacklog;
    }

    public List<ProjectOptionDTO> getAccessibleProjects() {
        return accessibleProjects;
    }

    public void setAccessibleProjects(List<ProjectOptionDTO> accessibleProjects) {
        this.accessibleProjects = accessibleProjects;
    }

    public List<SprintOptionDTO> getSprintOptions() {
        return sprintOptions;
    }

    public void setSprintOptions(List<SprintOptionDTO> sprintOptions) {
        this.sprintOptions = sprintOptions;
    }

    public List<DeveloperSprintMetricDTO> getTaskMetrics() {
        return taskMetrics;
    }

    public void setTaskMetrics(List<DeveloperSprintMetricDTO> taskMetrics) {
        this.taskMetrics = taskMetrics;
    }

    public List<DeveloperSprintMetricDTO> getRealHoursMetrics() {
        return realHoursMetrics;
    }

    public void setRealHoursMetrics(List<DeveloperSprintMetricDTO> realHoursMetrics) {
        this.realHoursMetrics = realHoursMetrics;
    }

    public Long getTotalTasksDone() {
        return totalTasksDone;
    }

    public void setTotalTasksDone(Long totalTasksDone) {
        this.totalTasksDone = totalTasksDone;
    }

    public Double getTotalRealHours() {
        return totalRealHours;
    }

    public void setTotalRealHours(Double totalRealHours) {
        this.totalRealHours = totalRealHours;
    }

    public DeveloperPerformanceDTO getTopTaskPerformer() {
        return topTaskPerformer;
    }

    public void setTopTaskPerformer(DeveloperPerformanceDTO topTaskPerformer) {
        this.topTaskPerformer = topTaskPerformer;
    }

    public DeveloperPerformanceDTO getTopHourPerformer() {
        return topHourPerformer;
    }

    public void setTopHourPerformer(DeveloperPerformanceDTO topHourPerformer) {
        this.topHourPerformer = topHourPerformer;
    }

    public DeveloperPerformanceDTO getBestEfficiency() {
        return bestEfficiency;
    }

    public void setBestEfficiency(DeveloperPerformanceDTO bestEfficiency) {
        this.bestEfficiency = bestEfficiency;
    }

    public DeveloperPerformanceDTO getMostLoadedDeveloper() {
        return mostLoadedDeveloper;
    }

    public void setMostLoadedDeveloper(DeveloperPerformanceDTO mostLoadedDeveloper) {
        this.mostLoadedDeveloper = mostLoadedDeveloper;
    }

    public List<String> getKeyFindings() {
        return keyFindings;
    }

    public void setKeyFindings(List<String> keyFindings) {
        this.keyFindings = keyFindings;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }
}