package com.springboot.MyTodoList.dto.analytics;

public class DeveloperSprintMetricDTO {

    private Long projectId;
    private String projectName;
    private Long sprintId;
    private String sprintName;
    private Long developerId;
    private String developerName;
    private Long totalTasks;
    private Long completedTasks;
    private Double realHours;
    private Long blockedTasks;
    private Double storyPoints;

    public DeveloperSprintMetricDTO() {
    }

    public DeveloperSprintMetricDTO(Long projectId,
                                    String projectName,
                                    Long sprintId,
                                    String sprintName,
                                    Long developerId,
                                    String developerName,
                                    Long totalTasks,
                                    Long completedTasks,
                                    Double realHours,
                                    Long blockedTasks,
                                    Double storyPoints) {
        this.projectId = projectId;
        this.projectName = projectName;
        this.sprintId = sprintId;
        this.sprintName = sprintName;
        this.developerId = developerId;
        this.developerName = developerName;
        this.totalTasks = totalTasks;
        this.completedTasks = completedTasks;
        this.realHours = realHours;
        this.blockedTasks = blockedTasks;
        this.storyPoints = storyPoints;
    }

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

    public Long getSprintId() {
        return sprintId;
    }

    public void setSprintId(Long sprintId) {
        this.sprintId = sprintId;
    }

    public String getSprintName() {
        return sprintName;
    }

    public void setSprintName(String sprintName) {
        this.sprintName = sprintName;
    }

    public Long getDeveloperId() {
        return developerId;
    }

    public void setDeveloperId(Long developerId) {
        this.developerId = developerId;
    }

    public String getDeveloperName() {
        return developerName;
    }

    public void setDeveloperName(String developerName) {
        this.developerName = developerName;
    }

    public Long getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(Long totalTasks) {
        this.totalTasks = totalTasks;
    }

    public Long getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(Long completedTasks) {
        this.completedTasks = completedTasks;
    }

    public Double getRealHours() {
        return realHours;
    }

    public void setRealHours(Double realHours) {
        this.realHours = realHours;
    }

    public Long getBlockedTasks() {
        return blockedTasks;
    }

    public void setBlockedTasks(Long blockedTasks) {
        this.blockedTasks = blockedTasks;
    }

    public Double getStoryPoints() {
        return storyPoints;
    }

    public void setStoryPoints(Double storyPoints) {
        this.storyPoints = storyPoints;
    }

    public double getEfficiencyRatio() {
        if (realHours == null || realHours.doubleValue() <= 0d) {
            return 0d;
        }

        long completed = completedTasks == null ? 0L : completedTasks;
        return roundToTwoDecimals(completed / realHours.doubleValue());
    }

    public double getCompletionRate() {
        long total = totalTasks == null ? 0L : totalTasks;
        if (total <= 0L) {
            return 0d;
        }

        long completed = completedTasks == null ? 0L : completedTasks;
        return roundToTwoDecimals((double) completed / (double) total);
    }

    private double roundToTwoDecimals(double value) {
        return Math.round(value * 100.0d) / 100.0d;
    }
}