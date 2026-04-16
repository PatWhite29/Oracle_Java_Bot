package com.springboot.MyTodoList.dto.analytics;

import java.time.LocalDate;

public class SprintOptionDTO {

    private Long id;
    private String label;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean backlog;

    public SprintOptionDTO() {
    }

    public SprintOptionDTO(Long id, String label, String status, LocalDate startDate, LocalDate endDate, boolean backlog) {
        this.id = id;
        this.label = label;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
        this.backlog = backlog;
    }

    public static SprintOptionDTO backlogOption() {
        return new SprintOptionDTO(null, "Backlog", "BACKLOG", null, null, true);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public boolean isBacklog() {
        return backlog;
    }

    public void setBacklog(boolean backlog) {
        this.backlog = backlog;
    }
}