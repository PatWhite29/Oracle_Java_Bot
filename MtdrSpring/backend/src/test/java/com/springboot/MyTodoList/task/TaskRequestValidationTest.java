package com.springboot.MyTodoList.task;

import com.springboot.MyTodoList.common.enums.TaskStatus;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class TaskRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setup() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test // Test #10
    void taskName_blank_failsValidation() {
        TaskRequest req = new TaskRequest();
        req.setTaskName("");
        req.setStatus(TaskStatus.TODO);
        req.setStoryPoints(1);

        Set<ConstraintViolation<TaskRequest>> violations = validator.validate(req);

        assertThat(violations)
                .anyMatch(v -> v.getPropertyPath().toString().equals("taskName"));
    }

    @Test // Test #12
    void taskName_onlyEmojis_passesValidation() {
        TaskRequest req = new TaskRequest();
        req.setTaskName("🚀🎯💡");
        req.setStatus(TaskStatus.TODO);
        req.setStoryPoints(1);

        Set<ConstraintViolation<TaskRequest>> violations = validator.validate(req);

        assertThat(violations)
                .noneMatch(v -> v.getPropertyPath().toString().equals("taskName"));
    }
}
