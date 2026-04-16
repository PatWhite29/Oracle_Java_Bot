package com.springboot.MyTodoList.dto.analytics;

public class SprintImbalanceDTO {

    private Long sprintId;
    private String sprintName;
    private Double totalRealHours;
    private Double averageRealHours;
    private Double dispersionIndex;
    private String message;

    public SprintImbalanceDTO() {
    }

    public SprintImbalanceDTO(Long sprintId, String sprintName, Double totalRealHours, Double averageRealHours, Double dispersionIndex, String message) {
        this.sprintId = sprintId;
        this.sprintName = sprintName;
        this.totalRealHours = totalRealHours;
        this.averageRealHours = averageRealHours;
        this.dispersionIndex = dispersionIndex;
        this.message = message;
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

    public Double getTotalRealHours() {
        return totalRealHours;
    }

    public void setTotalRealHours(Double totalRealHours) {
        this.totalRealHours = totalRealHours;
    }

    public Double getAverageRealHours() {
        return averageRealHours;
    }

    public void setAverageRealHours(Double averageRealHours) {
        this.averageRealHours = averageRealHours;
    }

    public Double getDispersionIndex() {
        return dispersionIndex;
    }

    public void setDispersionIndex(Double dispersionIndex) {
        this.dispersionIndex = dispersionIndex;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}