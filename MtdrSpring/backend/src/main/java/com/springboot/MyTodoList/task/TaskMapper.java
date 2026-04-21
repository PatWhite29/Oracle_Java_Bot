package com.springboot.MyTodoList.task;

import com.springboot.MyTodoList.sprint.Sprint;
import com.springboot.MyTodoList.sprint.SprintSummary;
import com.springboot.MyTodoList.user.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface TaskMapper {
    @Mapping(source = "project.id", target = "projectId")
    @Mapping(source = "sprint.id", target = "sprintId")
    @Mapping(source = "sprint", target = "sprint")
    TaskResponse toResponse(Task task);

    default SprintSummary toSprintSummary(Sprint sprint) {
        if (sprint == null) return null;
        return new SprintSummary(sprint.getId(), sprint.getSprintName(), sprint.getStatus());
    }
}
