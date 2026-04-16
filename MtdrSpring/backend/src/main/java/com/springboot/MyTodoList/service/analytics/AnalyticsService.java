package com.springboot.MyTodoList.service.analytics;

import com.springboot.MyTodoList.dto.analytics.AnalyticsInsightsDto;
import com.springboot.MyTodoList.dto.analytics.AnalyticsSummaryDTO;
import com.springboot.MyTodoList.dto.analytics.DeveloperPerformanceDTO;
import com.springboot.MyTodoList.dto.analytics.DeveloperSprintMetricDTO;
import com.springboot.MyTodoList.dto.analytics.ProjectOptionDTO;
import com.springboot.MyTodoList.dto.analytics.SprintImbalanceDTO;
import com.springboot.MyTodoList.dto.analytics.SprintOptionDTO;
import com.springboot.MyTodoList.dto.analytics.UserLoadInsightDTO;
import com.springboot.MyTodoList.model.Project;
import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.repository.ProjectRepository;
import com.springboot.MyTodoList.repository.SprintRepository;
import com.springboot.MyTodoList.repository.TaskRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsService {

    private final ProjectAccessService projectAccessService;
    private final ProjectRepository projectRepository;
    private final SprintRepository sprintRepository;
    private final TaskRepository taskRepository;

    public AnalyticsService(ProjectAccessService projectAccessService,
                            ProjectRepository projectRepository,
                            SprintRepository sprintRepository,
                            TaskRepository taskRepository) {
        this.projectAccessService = projectAccessService;
        this.projectRepository = projectRepository;
        this.sprintRepository = sprintRepository;
        this.taskRepository = taskRepository;
    }

    public List<ProjectOptionDTO> getAccessibleProjects(Long userId) {
        List<Project> projects = projectRepository.findAccessibleProjects(userId);
        List<ProjectOptionDTO> options = new ArrayList<ProjectOptionDTO>();

        for (Project project : projects) {
            options.add(new ProjectOptionDTO(project.getId(), project.getProjectName(), project.getStatus().name()));
        }

        return options;
    }

    public List<DeveloperSprintMetricDTO> getMetrics(Long projectId, Long sprintId, Long userId) {
        projectAccessService.requireAccessibleProject(projectId, userId);
        return taskRepository.findDeveloperSprintMetrics(projectId, sprintId);
    }

    public AnalyticsSummaryDTO buildSummary(Long projectId, Long sprintId, Long userId) {
        Project project = projectAccessService.requireAccessibleProject(projectId, userId);
        List<DeveloperSprintMetricDTO> metrics = taskRepository.findDeveloperSprintMetrics(projectId, sprintId);

        AnalyticsSummaryDTO summary = new AnalyticsSummaryDTO();
        summary.setProjectId(project.getId());
        summary.setProjectName(project.getProjectName());
        summary.setSelectedSprintId(sprintId);
        summary.setSelectedSprintLabel(resolveSprintLabel(projectId, sprintId));
        summary.setAllSprints(sprintId == null);
        summary.setHasBacklog(hasBacklog(metrics));
        summary.setAccessibleProjects(getAccessibleProjects(userId));
        summary.setSprintOptions(buildSprintOptions(projectId, metrics));
        summary.setTaskMetrics(metrics);
        summary.setRealHoursMetrics(metrics);

        DeveloperAggregate aggregate = aggregateByDeveloper(metrics);
        summary.setTotalTasksDone(aggregate.totalCompletedTasks);
        summary.setTotalRealHours(roundToTwoDecimals(aggregate.totalRealHours));
        summary.setTopTaskPerformer(buildTopTaskPerformer(aggregate.developerMetrics, "completed tasks"));
        summary.setTopHourPerformer(buildTopHourPerformer(aggregate.developerMetrics, "real hours"));
        summary.setBestEfficiency(buildBestEfficiency(aggregate.developerMetrics));
        summary.setMostLoadedDeveloper(buildMostLoadedDeveloper(aggregate.developerMetrics));

        AnalyticsInsightsDto insights = buildInsights(projectId, sprintId, userId, metrics);
        summary.setKeyFindings(insights.getKeyFindings());
        summary.setRecommendations(insights.getRecommendations());

        return summary;
    }

    public AnalyticsInsightsDto buildInsights(Long projectId, Long sprintId, Long userId) {
        List<DeveloperSprintMetricDTO> metrics = taskRepository.findDeveloperSprintMetrics(projectId, sprintId);
        return buildInsights(projectId, sprintId, userId, metrics);
    }

    public List<SprintOptionDTO> buildSprintOptions(Long projectId, List<DeveloperSprintMetricDTO> metrics) {
        List<Sprint> sprints = sprintRepository.findByProject_IdOrderByStartDateAsc(projectId);
        List<SprintOptionDTO> options = new ArrayList<SprintOptionDTO>();

        for (Sprint sprint : sprints) {
            String label = sprint.getSprintName();
            options.add(new SprintOptionDTO(
                    sprint.getId(),
                    label,
                    sprint.getStatus() == null ? null : sprint.getStatus().name(),
                    sprint.getStartDate(),
                    sprint.getEndDate(),
                    false
            ));
        }

        return options;
    }

    private AnalyticsInsightsDto buildInsights(Long projectId, Long sprintId, Long userId, List<DeveloperSprintMetricDTO> metrics) {
        projectAccessService.requireAccessibleProject(projectId, userId);
        DeveloperAggregate aggregate = aggregateByDeveloper(metrics);
        AnalyticsInsightsDto insights = new AnalyticsInsightsDto();

        insights.setTopPerformerByTasks(buildTopTaskPerformer(aggregate.developerMetrics, "completed more tasks than the rest of the team"));
        insights.setTopPerformerByHours(buildTopHourPerformer(aggregate.developerMetrics, "logged the highest real effort"));
        insights.setBestEfficiency(buildBestEfficiency(aggregate.developerMetrics));

        insights.setOverloadedUsers(buildLoadInsights(aggregate.developerMetrics, true));
        insights.setUnderutilizedUsers(buildLoadInsights(aggregate.developerMetrics, false));
        insights.setSprintImbalances(buildSprintImbalances(metrics));
        insights.setBlockedTaskPatterns(buildBlockedTaskPatterns(metrics));
        insights.setRecommendations(buildRecommendations(aggregate.developerMetrics, metrics));
        insights.setKeyFindings(buildKeyFindings(aggregate.developerMetrics, metrics));

        return insights;
    }

    private List<String> buildBlockedTaskPatterns(List<DeveloperSprintMetricDTO> metrics) {
        List<String> patterns = new ArrayList<String>();

        Map<String, Long> blockedBySprint = new LinkedHashMap<String, Long>();
        Map<String, Long> totalBySprint = new LinkedHashMap<String, Long>();

        for (DeveloperSprintMetricDTO metric : metrics) {
            String sprintLabel = sprintLabel(metric);
            long blocked = metric.getBlockedTasks() == null ? 0L : metric.getBlockedTasks();
            long total = metric.getTotalTasks() == null ? 0L : metric.getTotalTasks();

            if (!blockedBySprint.containsKey(sprintLabel)) {
                blockedBySprint.put(sprintLabel, 0L);
                totalBySprint.put(sprintLabel, 0L);
            }

            blockedBySprint.put(sprintLabel, blockedBySprint.get(sprintLabel) + blocked);
            totalBySprint.put(sprintLabel, totalBySprint.get(sprintLabel) + total);
        }

        for (Map.Entry<String, Long> entry : blockedBySprint.entrySet()) {
            String sprintLabel = entry.getKey();
            long blocked = entry.getValue();
            long total = totalBySprint.get(sprintLabel) == null ? 0L : totalBySprint.get(sprintLabel);

            if (total > 0L && blocked > 0L) {
                double ratio = (double) blocked / (double) total;
                if (ratio >= 0.2d) {
                    patterns.add(sprintLabel + " has repeated blocked-task patterns (" + roundToTwoDecimals(ratio * 100d) + "% blocked tasks).");
                }
            }
        }

        if (patterns.isEmpty()) {
            patterns.add("No strong blocked-task concentration was detected in the selected scope.");
        }

        return patterns;
    }

    private List<String> buildRecommendations(List<DeveloperAggregateRow> developerRows, List<DeveloperSprintMetricDTO> metrics) {
        List<String> recommendations = new ArrayList<String>();
        List<UserLoadInsightDTO> overloaded = buildLoadInsights(developerRows, true);
        List<UserLoadInsightDTO> underutilized = buildLoadInsights(developerRows, false);
        List<SprintImbalanceDTO> imbalances = buildSprintImbalances(metrics);

        if (!overloaded.isEmpty()) {
            recommendations.add("Redistribute workload from overloaded developers to balance sprint execution.");
        }
        if (!underutilized.isEmpty()) {
            recommendations.add("Review assignments for underutilized developers and use them to absorb smaller or parallel tasks.");
        }
        if (!imbalances.isEmpty()) {
            recommendations.add("Revisit sprint planning to reduce workload dispersion and improve predictability.");
        }

        boolean largeTasksDetected = false;
        for (DeveloperSprintMetricDTO metric : metrics) {
            if (metric.getStoryPoints() != null && metric.getStoryPoints().doubleValue() >= 8d) {
                largeTasksDetected = true;
                break;
            }
        }
        if (largeTasksDetected) {
            recommendations.add("Split very large tasks into smaller deliverables to improve flow and reduce blocking risk.");
        }

        boolean blockingDetected = false;
        for (DeveloperSprintMetricDTO metric : metrics) {
            if (metric.getBlockedTasks() != null && metric.getBlockedTasks().longValue() > 0L) {
                blockingDetected = true;
                break;
            }
        }
        if (blockingDetected) {
            recommendations.add("Investigate repeated blockers and consider pairing or faster escalation paths.");
        }

        if (recommendations.isEmpty()) {
            recommendations.add("The team load looks stable. Keep monitoring completion ratio and real hours trend.");
        }

        return recommendations;
    }

    private List<String> buildKeyFindings(List<DeveloperAggregateRow> developerRows, List<DeveloperSprintMetricDTO> metrics) {
        List<String> findings = new ArrayList<String>();
        DeveloperPerformanceDTO topTasks = buildTopTaskPerformer(developerRows, "completed more tasks than the rest of the team");
        DeveloperPerformanceDTO topHours = buildTopHourPerformer(developerRows, "logged the highest real effort");
        DeveloperPerformanceDTO bestEfficiency = buildBestEfficiency(developerRows);

        if (topTasks != null) {
            String sprintLabel = strongestSprintLabel(metrics, topTasks.getDeveloperId(), true);
            findings.add(topTasks.getDeveloperName() + " completed more tasks than the rest of the team" + sprintSuffix(sprintLabel) + ".");
        }
        if (topHours != null) {
            String sprintLabel = strongestSprintLabel(metrics, topHours.getDeveloperId(), false);
            findings.add(topHours.getDeveloperName() + " logged the highest real effort" + sprintSuffix(sprintLabel) + ", which may indicate overload or more complex work.");
        }
        if (bestEfficiency != null) {
            findings.add(bestEfficiency.getDeveloperName() + " shows the best efficiency ratio between completed tasks and real hours.");
        }

        List<SprintImbalanceDTO> imbalances = buildSprintImbalances(metrics);
        if (!imbalances.isEmpty()) {
            findings.add(imbalances.get(0).getMessage());
        }

        if (findings.isEmpty()) {
            findings.add("Not enough data to produce meaningful findings yet.");
        }

        return findings;
    }

    private List<UserLoadInsightDTO> buildLoadInsights(List<DeveloperAggregateRow> developerRows, boolean overloaded) {
        List<UserLoadInsightDTO> insights = new ArrayList<UserLoadInsightDTO>();
        if (developerRows.isEmpty()) {
            return insights;
        }

        double avgHours = 0d;
        double avgTasks = 0d;
        for (DeveloperAggregateRow row : developerRows) {
            avgHours += row.realHours;
            avgTasks += row.completedTasks;
        }
        avgHours = avgHours / developerRows.size();
        avgTasks = avgTasks / developerRows.size();

        double thresholdHours = overloaded ? avgHours * 1.25d : avgHours * 0.75d;
        double thresholdTasks = overloaded ? avgTasks * 1.25d : avgTasks * 0.75d;

        for (DeveloperAggregateRow row : developerRows) {
            boolean matchesHours = overloaded ? row.realHours >= thresholdHours : row.realHours <= thresholdHours;
            boolean matchesTasks = overloaded ? row.completedTasks >= thresholdTasks : row.completedTasks <= thresholdTasks;

            if (matchesHours && matchesTasks) {
                String message = overloaded
                        ? row.developerName + " appears overloaded compared with the team average."
                        : row.developerName + " is underutilized compared with the team average.";
                insights.add(new UserLoadInsightDTO(
                        row.developerId,
                        row.developerName,
                        overloaded ? row.realHours : row.completedTasks,
                        overloaded ? avgHours : avgTasks,
                        overloaded ? thresholdHours : thresholdTasks,
                        message
                ));
            }
        }

        return insights;
    }

    private List<SprintImbalanceDTO> buildSprintImbalances(List<DeveloperSprintMetricDTO> metrics) {
        Map<String, List<Double>> hoursBySprint = new TreeMap<String, List<Double>>();
        Map<String, Long> sprintIds = new HashMap<String, Long>();

        for (DeveloperSprintMetricDTO metric : metrics) {
            String sprintLabel = sprintLabel(metric);
            if (!hoursBySprint.containsKey(sprintLabel)) {
                hoursBySprint.put(sprintLabel, new ArrayList<Double>());
            }
            hoursBySprint.get(sprintLabel).add(metric.getRealHours() == null ? 0d : metric.getRealHours());
            sprintIds.put(sprintLabel, metric.getSprintId());
        }

        List<SprintImbalanceDTO> imbalances = new ArrayList<SprintImbalanceDTO>();
        for (Map.Entry<String, List<Double>> entry : hoursBySprint.entrySet()) {
            String sprintLabel = entry.getKey();
            List<Double> values = entry.getValue();
            if (values.size() < 2) {
                continue;
            }

            double total = 0d;
            for (Double value : values) {
                total += value == null ? 0d : value;
            }
            double average = total / values.size();
            double variance = 0d;
            for (Double value : values) {
                double diff = (value == null ? 0d : value) - average;
                variance += diff * diff;
            }
            variance = variance / values.size();
            double dispersionIndex = average <= 0d ? 0d : Math.sqrt(variance) / average;

            if (dispersionIndex >= 0.45d) {
                imbalances.add(new SprintImbalanceDTO(
                        sprintIds.get(sprintLabel),
                        sprintLabel,
                        roundToTwoDecimals(total),
                        roundToTwoDecimals(average),
                        roundToTwoDecimals(dispersionIndex),
                        sprintLabel + " shows workload imbalance across developers."
                ));
            }
        }

        return imbalances;
    }

    private DeveloperPerformanceDTO buildTopTaskPerformer(List<DeveloperAggregateRow> developerRows, String description) {
        DeveloperAggregateRow row = null;
        for (DeveloperAggregateRow current : developerRows) {
            if (row == null || current.completedTasks > row.completedTasks) {
                row = current;
            }
        }

        if (row == null) {
            return null;
        }

        return new DeveloperPerformanceDTO(row.developerId, row.developerName, row.completedTasks, roundToTwoDecimals(row.realHours), row.efficiencyRatio(), row.developerName + " " + description + ".");
    }

    private DeveloperPerformanceDTO buildTopHourPerformer(List<DeveloperAggregateRow> developerRows, String description) {
        DeveloperAggregateRow row = null;
        for (DeveloperAggregateRow current : developerRows) {
            if (row == null || current.realHours > row.realHours) {
                row = current;
            }
        }

        if (row == null) {
            return null;
        }

        return new DeveloperPerformanceDTO(row.developerId, row.developerName, row.completedTasks, roundToTwoDecimals(row.realHours), row.efficiencyRatio(), row.developerName + " " + description + ".");
    }

    private DeveloperPerformanceDTO buildBestEfficiency(List<DeveloperAggregateRow> developerRows) {
        DeveloperAggregateRow row = null;
        for (DeveloperAggregateRow current : developerRows) {
            if (current.realHours <= 0d || current.completedTasks <= 0L) {
                continue;
            }
            if (row == null || current.efficiencyRatio() > row.efficiencyRatio()) {
                row = current;
            }
        }

        if (row == null) {
            return null;
        }

        return new DeveloperPerformanceDTO(row.developerId, row.developerName, row.completedTasks, roundToTwoDecimals(row.realHours), row.efficiencyRatio(), row.developerName + " shows the best efficiency ratio.");
    }

    private DeveloperPerformanceDTO buildMostLoadedDeveloper(List<DeveloperAggregateRow> developerRows) {
        DeveloperAggregateRow row = null;
        for (DeveloperAggregateRow current : developerRows) {
            if (row == null || current.loadScore() > row.loadScore()) {
                row = current;
            }
        }

        if (row == null) {
            return null;
        }

        return new DeveloperPerformanceDTO(row.developerId, row.developerName, row.completedTasks, roundToTwoDecimals(row.realHours), row.efficiencyRatio(), row.developerName + " carries the highest combined workload.");
    }

    private DeveloperAggregate aggregateByDeveloper(List<DeveloperSprintMetricDTO> metrics) {
        Map<Long, DeveloperAggregateRow> rows = new LinkedHashMap<Long, DeveloperAggregateRow>();
        long totalCompletedTasks = 0L;
        double totalRealHours = 0d;

        for (DeveloperSprintMetricDTO metric : metrics) {
            Long developerId = metric.getDeveloperId();
            if (developerId == null) {
                continue;
            }

            DeveloperAggregateRow row = rows.get(developerId);
            if (row == null) {
                row = new DeveloperAggregateRow(developerId, metric.getDeveloperName());
                rows.put(developerId, row);
            }

            long completedTasks = metric.getCompletedTasks() == null ? 0L : metric.getCompletedTasks();
            double realHours = metric.getRealHours() == null ? 0d : metric.getRealHours();
            long blockedTasks = metric.getBlockedTasks() == null ? 0L : metric.getBlockedTasks();
            row.completedTasks += completedTasks;
            row.realHours += realHours;
            row.blockedTasks += blockedTasks;

            totalCompletedTasks += completedTasks;
            totalRealHours += realHours;
        }

        DeveloperAggregate aggregate = new DeveloperAggregate();
        aggregate.developerMetrics = new ArrayList<DeveloperAggregateRow>(rows.values());
        aggregate.totalCompletedTasks = totalCompletedTasks;
        aggregate.totalRealHours = totalRealHours;
        return aggregate;
    }

    private String resolveSprintLabel(Long projectId, Long sprintId) {
        if (sprintId == null) {
            return "All sprints";
        }

        List<Sprint> sprints = sprintRepository.findByProject_IdOrderByStartDateAsc(projectId);
        for (Sprint sprint : sprints) {
            if (sprintId.equals(sprint.getId())) {
                return sprint.getSprintName();
            }
        }

        return "Selected sprint";
    }

    private String sprintLabel(DeveloperSprintMetricDTO metric) {
        if (metric.getSprintId() == null) {
            return "Backlog";
        }

        return metric.getSprintName() == null ? "Sprint" + metric.getSprintId() : metric.getSprintName();
    }

    private String strongestSprintLabel(List<DeveloperSprintMetricDTO> metrics, Long developerId, boolean byTasks) {
        Map<String, Double> valuesBySprint = new LinkedHashMap<String, Double>();
        for (DeveloperSprintMetricDTO metric : metrics) {
            if (developerId == null || !developerId.equals(metric.getDeveloperId())) {
                continue;
            }

            String label = sprintLabel(metric);
            Double current = valuesBySprint.get(label);
            double value = byTasks
                    ? (metric.getCompletedTasks() == null ? 0d : metric.getCompletedTasks().doubleValue())
                    : (metric.getRealHours() == null ? 0d : metric.getRealHours());
            valuesBySprint.put(label, current == null ? value : current + value);
        }

        String strongestLabel = null;
        double highestValue = Double.NEGATIVE_INFINITY;
        for (Map.Entry<String, Double> entry : valuesBySprint.entrySet()) {
            if (entry.getValue() != null && entry.getValue() > highestValue) {
                highestValue = entry.getValue();
                strongestLabel = entry.getKey();
            }
        }

        return strongestLabel;
    }

    private String sprintSuffix(String sprintLabel) {
        if (sprintLabel == null || sprintLabel.trim().isEmpty()) {
            return "";
        }
        return " in " + sprintLabel;
    }

    private boolean hasBacklog(List<DeveloperSprintMetricDTO> metrics) {
        for (DeveloperSprintMetricDTO metric : metrics) {
            if (metric.getSprintId() == null) {
                return true;
            }
        }

        return false;
    }

    private double roundToTwoDecimals(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private static class DeveloperAggregate {
        private List<DeveloperAggregateRow> developerMetrics = Collections.<DeveloperAggregateRow>emptyList();
        private long totalCompletedTasks;
        private double totalRealHours;
    }

    private static class DeveloperAggregateRow {
        private final Long developerId;
        private final String developerName;
        private long completedTasks;
        private long blockedTasks;
        private double realHours;

        private DeveloperAggregateRow(Long developerId, String developerName) {
            this.developerId = developerId;
            this.developerName = developerName == null ? "Unknown" : developerName;
        }

        private double efficiencyRatio() {
            if (realHours <= 0d) {
                return 0d;
            }

            return round(completedTasks / realHours);
        }

        private double loadScore() {
            return realHours + (completedTasks * 0.35d) + (blockedTasks * 0.5d);
        }

        private double round(double value) {
            return Math.round(value * 100.0d) / 100.0d;
        }
    }
}