package com.springboot.MyTodoList.project.member;

import com.springboot.MyTodoList.audit.AuditLogService;
import com.springboot.MyTodoList.common.PagedResponse;
import com.springboot.MyTodoList.common.enums.AuditAction;
import com.springboot.MyTodoList.common.enums.EntityType;
import com.springboot.MyTodoList.common.exception.ConflictException;
import com.springboot.MyTodoList.common.exception.ResourceNotFoundException;
import com.springboot.MyTodoList.project.Project;
import com.springboot.MyTodoList.project.ProjectService;
import com.springboot.MyTodoList.user.User;
import com.springboot.MyTodoList.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectMemberService {

    private final ProjectMemberRepository memberRepository;
    private final ProjectService projectService;
    private final UserService userService;
    private final AuditLogService auditLogService;
    private final ProjectMemberMapper memberMapper;

    @Transactional
    public ProjectMemberResponse addMember(Long actorId, Long projectId, AddMemberRequest request) {
        User actor = userService.findActiveUserById(actorId);
        Project project = projectService.findProject(projectId);
        projectService.requireManager(actorId, project);

        User newMember = userService.findActiveUserById(request.getUserId());
        if (memberRepository.existsByProjectAndEmployee(project, newMember)) {
            throw new ConflictException("User is already a member of this project");
        }

        ProjectMember membership = ProjectMember.builder()
                .project(project)
                .employee(newMember)
                .build();
        memberRepository.save(membership);
        auditLogService.log(actor, EntityType.PROJECT_MEMBER, membership.getId(), AuditAction.CREATE, null, membership);
        return memberMapper.toResponse(membership);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProjectMemberResponse> listMembers(Long actorId, Long projectId, Pageable pageable) {
        Project project = projectService.findProject(projectId);
        projectService.requireParticipant(actorId, project);
        return PagedResponse.of(
                memberRepository.findAllByProject(project, pageable).map(memberMapper::toResponse)
        );
    }

    @Transactional
    public void removeMember(Long actorId, Long projectId, Long memberId) {
        User actor = userService.findActiveUserById(actorId);
        Project project = projectService.findProject(projectId);
        projectService.requireManager(actorId, project);
        User member = userService.findActiveUserById(memberId);
        if (!memberRepository.existsByProjectAndEmployee(project, member)) {
            throw new ResourceNotFoundException("User is not a member of this project");
        }
        ProjectMember membership = memberRepository.findByProjectAndEmployee(project, member)
                .orElseThrow(() -> new ResourceNotFoundException("Membership not found"));
        auditLogService.log(actor, EntityType.PROJECT_MEMBER, membership.getId(), AuditAction.DELETE, membership, null);
        memberRepository.deleteByProjectAndEmployee(project, member);
    }
}
