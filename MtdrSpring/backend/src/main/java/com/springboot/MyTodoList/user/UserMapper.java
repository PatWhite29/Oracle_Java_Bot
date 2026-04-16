package com.springboot.MyTodoList.user;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);
    UserSummary toSummary(User user);
}
