package com.springboot.MyTodoList.config;

import com.springboot.MyTodoList.model.ToDoItem;
import com.springboot.MyTodoList.repository.ToDoItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Configuration
@ConditionalOnProperty(name = "app.analytics.seed-demo-data", havingValue = "true")
public class AnalyticsDemoDataSeeder {

    @Bean
    public CommandLineRunner seedAnalyticsDemoData(ToDoItemRepository repository) {
        return args -> {
            if (repository.count() > 0) {
                return;
            }

            List<ToDoItem> demoTasks = new ArrayList<ToDoItem>();
            demoTasks.add(createTask("Design analytics layout", "Carlos Vega", "Sprint 3", true, 4.5, 3));
            demoTasks.add(createTask("Refine sprint metrics", "Carlos Vega", "Sprint 3", true, 3.0, 2));
            demoTasks.add(createTask("Automate insight rules", "Carlos Vega", "Sprint 3", true, 4.2, 1));
            demoTasks.add(createTask("Build charts component", "Ana Torres", "Sprint 3", true, 6.0, 1));
            demoTasks.add(createTask("Tune dashboard filters", "Ana Torres", "Sprint 2", true, 5.5, 2));
            demoTasks.add(createTask("Improve recommendation copy", "Ana Torres", "Sprint 2", true, 3.6, 4));
            demoTasks.add(createTask("Fix analytics API", "Luis García", "Sprint 2", true, 2.0, 2));
            demoTasks.add(createTask("Handle empty states", "Luis García", "Sprint 1", true, 2.5, 5));
            demoTasks.add(createTask("Review load balance", "María Pérez", "Sprint 1", true, 1.2, 6));
            demoTasks.add(createTask("Validate sprint filter", "María Pérez", "Sprint 1", true, 1.8, 3));

            repository.saveAll(demoTasks);
        };
    }

    private ToDoItem createTask(String title, String assignee, String sprint, boolean done, double realHours, int daysAgo) {
        OffsetDateTime completedAt = OffsetDateTime.now().minusDays(daysAgo);
        ToDoItem item = new ToDoItem();
        item.setTitle(title);
        item.setDescription(title);
        item.setAssignee(assignee);
        item.setComplexity(realHours >= 4 ? "High" : realHours >= 2 ? "Medium" : "Low");
        item.setSprint(sprint);
        item.setRealHours(realHours);
        item.setCreation_ts(completedAt.minusHours(Math.max(1, Math.round(realHours))));
        item.setStartTime(item.getCreation_ts());
        item.setCompletedAt(completedAt);
        item.setEndTime(completedAt);
        item.setDone(done);
        return item;
    }
}
