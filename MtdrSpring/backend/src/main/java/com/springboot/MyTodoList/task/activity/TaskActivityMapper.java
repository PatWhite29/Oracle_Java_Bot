package com.springboot.MyTodoList.task.activity;

import com.springboot.MyTodoList.user.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface TaskActivityMapper {
    @Mapping(source = "task.id", target = "taskId")
    TaskActivityResponse toResponse(TaskActivity activity);
}
