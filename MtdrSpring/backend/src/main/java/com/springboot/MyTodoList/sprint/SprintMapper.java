package com.springboot.MyTodoList.sprint;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SprintMapper {
    @Mapping(source = "project.id", target = "projectId")
    SprintResponse toResponse(Sprint sprint);
}
