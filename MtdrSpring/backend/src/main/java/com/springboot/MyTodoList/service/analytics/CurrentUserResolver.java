package com.springboot.MyTodoList.service.analytics;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class CurrentUserResolver {

    public Long resolveUserId(HttpServletRequest request) {
        String headerValue = firstNonBlank(
                request.getHeader("X-User-Id"),
                request.getHeader("X-Current-User-Id"),
                request.getHeader("X-Authenticated-User-Id")
        );

        if (headerValue == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing user identity header");
        }

        try {
            return Long.valueOf(headerValue.trim());
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid user identity header");
        }
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.trim().isEmpty()) {
                return value.trim();
            }
        }

        return null;
    }
}