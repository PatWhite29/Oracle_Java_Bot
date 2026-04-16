package com.springboot.MyTodoList.dto.analytics;

public class DeveloperPerformanceDTO {

    private Long developerId;
    private String developerName;
    private Long completedTasks;
    private Double realHours;
    private Double efficiencyRatio;
    private String message;

    public DeveloperPerformanceDTO() {
    }

    public DeveloperPerformanceDTO(Long developerId, String developerName, Long completedTasks, Double realHours, Double efficiencyRatio, String message) {
        this.developerId = developerId;
        this.developerName = developerName;
        this.completedTasks = completedTasks;
        this.realHours = realHours;
        this.efficiencyRatio = efficiencyRatio;
        this.message = message;
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

    public Double getEfficiencyRatio() {
        return efficiencyRatio;
    }

    public void setEfficiencyRatio(Double efficiencyRatio) {
        this.efficiencyRatio = efficiencyRatio;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}