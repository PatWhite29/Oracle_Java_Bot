package com.springboot.MyTodoList.telegram.handler;

import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.objects.Update;

@Component
public class CommentHandler {
    // TODO: handle /comment {id} {text} — add a comment to a task (calls TaskActivityService.addComment)
    public void handle(Update update) {}
}
