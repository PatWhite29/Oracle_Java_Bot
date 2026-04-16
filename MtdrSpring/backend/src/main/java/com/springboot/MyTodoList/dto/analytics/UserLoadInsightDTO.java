package com.springboot.MyTodoList.dto.analytics;

public class UserLoadInsightDTO {

    private Long developerId;
    private String developerName;
    private Double value;
    private Double averageValue;
    private Double threshold;
    private String message;

    public UserLoadInsightDTO() {
    }

    public UserLoadInsightDTO(Long developerId, String developerName, Double value, Double averageValue, Double threshold, String message) {
        this.developerId = developerId;
        this.developerName = developerName;
        this.value = value;
        this.averageValue = averageValue;
        this.threshold = threshold;
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

    public Double getValue() {
        return value;
    }

    public void setValue(Double value) {
        this.value = value;
    }

    public Double getAverageValue() {
        return averageValue;
    }

    public void setAverageValue(Double averageValue) {
        this.averageValue = averageValue;
    }

    public Double getThreshold() {
        return threshold;
    }

    public void setThreshold(Double threshold) {
        this.threshold = threshold;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}