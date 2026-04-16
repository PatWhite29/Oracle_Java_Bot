package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.ToDoItem;
import com.springboot.MyTodoList.repository.ToDoItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.Duration;
import java.util.List;
import java.util.Optional;

@Service
public class ToDoItemService {

    @Autowired
    private ToDoItemRepository toDoItemRepository;
    public List<ToDoItem> findAll(){
        List<ToDoItem> todoItems = toDoItemRepository.findAll();
        return todoItems;
    }
    public ResponseEntity<ToDoItem> getItemById(int id){
        Optional<ToDoItem> todoData = toDoItemRepository.findById(id);
        if (todoData.isPresent()){
            return new ResponseEntity<>(todoData.get(), HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    public ToDoItem getToDoItemById(int id){
        Optional<ToDoItem> todoData = toDoItemRepository.findById(id);
        if (todoData.isPresent()){
            return todoData.get();
        }else{
            return null;
        }
    }

    
    public ToDoItem addToDoItem(ToDoItem toDoItem){
        applyTaskDefaults(toDoItem);
        return toDoItemRepository.save(toDoItem);
    }

    public boolean deleteToDoItem(int id){
        try{
            toDoItemRepository.deleteById(id);
            return true;
        }catch(Exception e){
            return false;
        }
    }
    public ToDoItem updateToDoItem(int id, ToDoItem td){
        Optional<ToDoItem> toDoItemData = toDoItemRepository.findById(id);
        if(toDoItemData.isPresent()){
            ToDoItem toDoItem = toDoItemData.get();
            toDoItem.setID(id);
            toDoItem.setCreation_ts(td.getCreation_ts() != null ? td.getCreation_ts() : toDoItem.getCreation_ts());
            toDoItem.setTitle(firstNonBlank(td.getTitle(), td.getDescription(), toDoItem.getTitle(), toDoItem.getDescription()));
            toDoItem.setDescription(firstNonBlank(td.getDescription(), td.getTitle(), toDoItem.getDescription(), toDoItem.getTitle()));
            toDoItem.setAssignee(firstNonBlank(td.getAssignee(), toDoItem.getAssignee(), "Unassigned"));
            toDoItem.setComplexity(normalizeComplexity(firstNonBlank(td.getComplexity(), toDoItem.getComplexity(), "Medium")));
            toDoItem.setSprint(firstNonBlank(td.getSprint(), toDoItem.getSprint(), deriveSprintLabel(toDoItem.getCreation_ts())));
            toDoItem.setRealHours(td.getRealHours() != null ? td.getRealHours() : toDoItem.getRealHours());
            toDoItem.setStartTime(td.getStartTime() != null ? td.getStartTime() : toDoItem.getStartTime());
            toDoItem.setDone(td.isDone());
            if (toDoItem.isDone()) {
                OffsetDateTime completedAt = td.getCompletedAt() != null ? td.getCompletedAt() :
                        (td.getEndTime() != null ? td.getEndTime() :
                                (toDoItem.getCompletedAt() != null ? toDoItem.getCompletedAt() :
                                        (toDoItem.getEndTime() != null ? toDoItem.getEndTime() : OffsetDateTime.now())));
                toDoItem.setCompletedAt(completedAt);
                toDoItem.setEndTime(td.getEndTime() != null ? td.getEndTime() : completedAt);
            } else {
                toDoItem.setEndTime(null);
                toDoItem.setCompletedAt(null);
                toDoItem.setRealHours(null);
            }
            applyTaskDefaults(toDoItem);
            return toDoItemRepository.save(toDoItem);
        }else{
            return null;
        }
    }

    private void applyTaskDefaults(ToDoItem toDoItem) {
        OffsetDateTime now = OffsetDateTime.now();

        toDoItem.setTitle(firstNonBlank(toDoItem.getTitle(), toDoItem.getDescription(), "Untitled task"));
        toDoItem.setDescription(firstNonBlank(toDoItem.getDescription(), toDoItem.getTitle(), "Untitled task"));
        toDoItem.setAssignee(firstNonBlank(toDoItem.getAssignee(), "Unassigned"));
        toDoItem.setComplexity(normalizeComplexity(firstNonBlank(toDoItem.getComplexity(), "Medium")));

        if (toDoItem.getCreation_ts() == null) {
            toDoItem.setCreation_ts(now);
        }

        toDoItem.setSprint(firstNonBlank(toDoItem.getSprint(), deriveSprintLabel(toDoItem.getCreation_ts())));

        if (toDoItem.getStartTime() == null) {
            toDoItem.setStartTime(toDoItem.getCreation_ts());
        }

        if (toDoItem.isDone() && toDoItem.getEndTime() == null) {
            toDoItem.setEndTime(now);
        }

        if (toDoItem.isDone() && toDoItem.getCompletedAt() == null) {
            toDoItem.setCompletedAt(toDoItem.getEndTime() != null ? toDoItem.getEndTime() : now);
        }

        if (toDoItem.isDone() && toDoItem.getRealHours() == null) {
            toDoItem.setRealHours(calculateRealHours(toDoItem));
        }

        if (!toDoItem.isDone()) {
            toDoItem.setEndTime(null);
            toDoItem.setCompletedAt(null);
        }
    }

    private Double calculateRealHours(ToDoItem toDoItem) {
        OffsetDateTime start = toDoItem.getStartTime() != null ? toDoItem.getStartTime() : toDoItem.getCreation_ts();
        OffsetDateTime end = toDoItem.getCompletedAt() != null ? toDoItem.getCompletedAt() : toDoItem.getEndTime();

        if (start != null && end != null && end.isAfter(start)) {
            double hours = Duration.between(start, end).toMinutes() / 60.0;
            return roundToTwoDecimals(Math.max(0.25d, hours));
        }

        String normalizedComplexity = normalizeComplexity(toDoItem.getComplexity());
        if ("High".equalsIgnoreCase(normalizedComplexity)) {
            return 4.0;
        }
        if ("Low".equalsIgnoreCase(normalizedComplexity)) {
            return 1.0;
        }

        return 2.0;
    }

    private double roundToTwoDecimals(double value) {
        return Math.round(value * 100.0d) / 100.0d;
    }

    private String deriveSprintLabel(OffsetDateTime reference) {
        if (reference == null) {
            return "Sprint 1";
        }

        int weekOfYear = reference.get(java.time.temporal.WeekFields.ISO.weekOfWeekBasedYear());
        int sprintNumber = weekOfYear <= 0 ? 1 : weekOfYear;
        return "Sprint " + sprintNumber;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.trim().isEmpty()) {
                return value.trim();
            }
        }

        return null;
    }

    private String normalizeComplexity(String complexity) {
        if (complexity == null || complexity.trim().isEmpty()) {
            return "Medium";
        }

        String normalizedComplexity = complexity.trim().toUpperCase();
        if ("LOW".equals(normalizedComplexity) || "BAJA".equals(normalizedComplexity)) {
            return "Low";
        }
        if ("HIGH".equals(normalizedComplexity) || "ALTA".equals(normalizedComplexity)) {
            return "High";
        }

        return "Medium";
    }
    

}
