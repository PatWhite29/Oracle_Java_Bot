package com.springboot.MyTodoList.dto.analytics;

public class ProjectOptionDTO {

    private Long id;
    private String label;
    private String status;

    public ProjectOptionDTO() {
    }

    public ProjectOptionDTO(Long id, String label, String status) {
        this.id = id;
        this.label = label;
        this.status = status;
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
}