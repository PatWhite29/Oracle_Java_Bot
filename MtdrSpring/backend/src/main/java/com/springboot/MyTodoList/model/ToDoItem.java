package com.springboot.MyTodoList.model;


import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.OffsetDateTime;

/*
    representation of the TODOITEM table that exists already
    in the autonomous database
 */
@Entity
@Table(name = "TODOITEM")
public class ToDoItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int ID;
    @Column(name = "TITLE")
    String title;
    @Column(name = "DESCRIPTION")
    String description;
    @Column(name = "ASSIGNEE")
    String assignee;
    @Column(name = "COMPLEXITY")
    String complexity;
    @Column(name = "SPRINT")
    String sprint;
    @Column(name = "REAL_HOURS")
    Double realHours;
    @Column(name = "COMPLETED_AT")
    OffsetDateTime completedAt;
    @Column(name = "CREATION_TS")
    OffsetDateTime creation_ts;
    @Column(name = "START_TIME")
    OffsetDateTime startTime;
    @Column(name = "END_TIME")
    OffsetDateTime endTime;
    @Column(name = "done")
    boolean done;
    public ToDoItem(){

    }
    public ToDoItem(int ID, String title, String description, String assignee, String complexity,
                    String sprint, Double realHours, OffsetDateTime completedAt,
                    OffsetDateTime creation_ts, OffsetDateTime startTime, OffsetDateTime endTime, boolean done) {
        this.ID = ID;
        this.title = title;
        this.description = description;
        this.assignee = assignee;
        this.complexity = complexity;
        this.sprint = sprint;
        this.realHours = realHours;
        this.completedAt = completedAt;
        this.creation_ts = creation_ts;
        this.startTime = startTime;
        this.endTime = endTime;
        this.done = done;
    }

    public int getID() {
        return ID;
    }

    public void setID(int ID) {
        this.ID = ID;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAssignee() {
        return assignee;
    }

    public void setAssignee(String assignee) {
        this.assignee = assignee;
    }

    public String getComplexity() {
        return complexity;
    }

    public void setComplexity(String complexity) {
        this.complexity = complexity;
    }

    public String getSprint() {
        return sprint;
    }

    public void setSprint(String sprint) {
        this.sprint = sprint;
    }

    public Double getRealHours() {
        return realHours;
    }

    public void setRealHours(Double realHours) {
        this.realHours = realHours;
    }

    public OffsetDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(OffsetDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public OffsetDateTime getCreation_ts() {
        return creation_ts;
    }

    public void setCreation_ts(OffsetDateTime creation_ts) {
        this.creation_ts = creation_ts;
    }

    public OffsetDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(OffsetDateTime startTime) {
        this.startTime = startTime;
    }

    public OffsetDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(OffsetDateTime endTime) {
        this.endTime = endTime;
    }

    public boolean isDone() {
        return done;
    }

    public void setDone(boolean done) {
        this.done = done;
    }

    @Transient
    public Double getProductivityKpi() {
        if (startTime == null) {
            return null;
        }

        OffsetDateTime effectiveEndTime = endTime != null ? endTime : OffsetDateTime.now();
        long minutesSpent = Math.max(1L, Duration.between(startTime, effectiveEndTime).toMinutes());

        String normalizedComplexity = complexity == null ? "MEDIUM" : complexity.trim().toUpperCase();
        double weightedOutput = 2.0;
        if ("HIGH".equals(normalizedComplexity) || "ALTA".equals(normalizedComplexity)) {
            weightedOutput = 3.0;
        } else if ("LOW".equals(normalizedComplexity) || "BAJA".equals(normalizedComplexity)) {
            weightedOutput = 1.0;
        }

        return BigDecimal.valueOf((weightedOutput * 60.0) / minutesSpent)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    @Override
    public String toString() {
        return "ToDoItem{" +
                "ID=" + ID +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", assignee='" + assignee + '\'' +
                ", complexity='" + complexity + '\'' +
                ", sprint='" + sprint + '\'' +
                ", realHours=" + realHours +
                ", completedAt=" + completedAt +
                ", creation_ts=" + creation_ts +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", done=" + done +
                '}';
    }
}
