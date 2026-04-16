package com.springboot.MyTodoList.project;

import com.springboot.MyTodoList.user.UserMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface ProjectMapper {
    ProjectResponse toResponse(Project project);
}
