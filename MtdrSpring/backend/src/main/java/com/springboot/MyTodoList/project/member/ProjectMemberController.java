package com.springboot.MyTodoList.project.member;

import com.springboot.MyTodoList.common.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/members")
@RequiredArgsConstructor
@Tag(name = "Project Members")
@SecurityRequirement(name = "bearerAuth")
public class ProjectMemberController {

    private final ProjectMemberService memberService;

    @PostMapping
    @Operation(summary = "Add a member to a project")
    public ResponseEntity<ProjectMemberResponse> add(@PathVariable Long projectId,
                                                      @Valid @RequestBody AddMemberRequest request,
                                                      Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(memberService.addMember(uid(auth), projectId, request));
    }

    @GetMapping
    @Operation(summary = "List project members")
    public ResponseEntity<PagedResponse<ProjectMemberResponse>> list(@PathVariable Long projectId,
                                                                      Pageable pageable,
                                                                      Authentication auth) {
        return ResponseEntity.ok(memberService.listMembers(uid(auth), projectId, pageable));
    }

    @DeleteMapping("/{userId}")
    @Operation(summary = "Remove a member from a project")
    public ResponseEntity<Void> remove(@PathVariable Long projectId,
                                        @PathVariable Long userId,
                                        Authentication auth) {
        memberService.removeMember(uid(auth), projectId, userId);
        return ResponseEntity.noContent().build();
    }

    private Long uid(Authentication auth) {
        return Long.parseLong(auth.getName());
    }
}
