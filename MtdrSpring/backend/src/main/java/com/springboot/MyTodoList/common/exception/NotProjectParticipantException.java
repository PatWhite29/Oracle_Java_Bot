package com.springboot.MyTodoList.common.exception;

public class NotProjectParticipantException extends RuntimeException {
    public NotProjectParticipantException(String message) {
        super(message);
    }
}
