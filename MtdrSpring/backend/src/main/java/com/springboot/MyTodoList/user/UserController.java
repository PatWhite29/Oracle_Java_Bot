package com.springboot.MyTodoList.user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get my profile")
    public ResponseEntity<UserResponse> getMe(Authentication auth) {
        return ResponseEntity.ok(userService.getMe(currentUserId(auth)));
    }

    @PutMapping("/me")
    @Operation(summary = "Update my profile")
    public ResponseEntity<UserResponse> updateMe(@Valid @RequestBody UserRequest request, Authentication auth) {
        return ResponseEntity.ok(userService.updateMe(currentUserId(auth), request));
    }

    private Long currentUserId(Authentication auth) {
        return Long.parseLong(auth.getName());
    }
}
