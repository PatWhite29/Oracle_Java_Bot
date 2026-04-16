package com.springboot.MyTodoList.project.member;

import com.springboot.MyTodoList.user.UserMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface ProjectMemberMapper {
    ProjectMemberResponse toResponse(ProjectMember member);
}
