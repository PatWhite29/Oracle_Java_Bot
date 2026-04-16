package com.springboot.MyTodoList.dto.analytics;

import java.util.ArrayList;
import java.util.List;

public class AnalyticsInsightsDto {

    private DeveloperPerformanceDTO topPerformerByTasks;
    private DeveloperPerformanceDTO topPerformerByHours;
    private DeveloperPerformanceDTO bestEfficiency;
    private List<UserLoadInsightDTO> overloadedUsers = new ArrayList<UserLoadInsightDTO>();
    private List<UserLoadInsightDTO> underutilizedUsers = new ArrayList<UserLoadInsightDTO>();
    private List<SprintImbalanceDTO> sprintImbalances = new ArrayList<SprintImbalanceDTO>();
    private List<String> blockedTaskPatterns = new ArrayList<String>();
    private List<String> recommendations = new ArrayList<String>();
    private List<String> keyFindings = new ArrayList<String>();

    public DeveloperPerformanceDTO getTopPerformerByTasks() {
        return topPerformerByTasks;
    }

    public void setTopPerformerByTasks(DeveloperPerformanceDTO topPerformerByTasks) {
        this.topPerformerByTasks = topPerformerByTasks;
    }

    public DeveloperPerformanceDTO getTopPerformerByHours() {
        return topPerformerByHours;
    }

    public void setTopPerformerByHours(DeveloperPerformanceDTO topPerformerByHours) {
        this.topPerformerByHours = topPerformerByHours;
    }

    public DeveloperPerformanceDTO getBestEfficiency() {
        return bestEfficiency;
    }

    public void setBestEfficiency(DeveloperPerformanceDTO bestEfficiency) {
        this.bestEfficiency = bestEfficiency;
    }

    public List<UserLoadInsightDTO> getOverloadedUsers() {
        return overloadedUsers;
    }

    public void setOverloadedUsers(List<UserLoadInsightDTO> overloadedUsers) {
        this.overloadedUsers = overloadedUsers;
    }

    public List<UserLoadInsightDTO> getUnderutilizedUsers() {
        return underutilizedUsers;
    }

    public void setUnderutilizedUsers(List<UserLoadInsightDTO> underutilizedUsers) {
        this.underutilizedUsers = underutilizedUsers;
    }

    public List<SprintImbalanceDTO> getSprintImbalances() {
        return sprintImbalances;
    }

    public void setSprintImbalances(List<SprintImbalanceDTO> sprintImbalances) {
        this.sprintImbalances = sprintImbalances;
    }

    public List<String> getBlockedTaskPatterns() {
        return blockedTaskPatterns;
    }

    public void setBlockedTaskPatterns(List<String> blockedTaskPatterns) {
        this.blockedTaskPatterns = blockedTaskPatterns;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }

    public List<String> getKeyFindings() {
        return keyFindings;
    }

    public void setKeyFindings(List<String> keyFindings) {
        this.keyFindings = keyFindings;
    }
}
