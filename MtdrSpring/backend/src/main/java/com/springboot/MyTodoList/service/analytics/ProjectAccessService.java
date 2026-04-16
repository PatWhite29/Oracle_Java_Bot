package com.springboot.MyTodoList.service.analytics;

import com.springboot.MyTodoList.model.Project;
import com.springboot.MyTodoList.repository.ProjectMemberRepository;
import com.springboot.MyTodoList.repository.ProjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProjectAccessService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

    public ProjectAccessService(ProjectRepository projectRepository, ProjectMemberRepository projectMemberRepository) {
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
    }

    public Project requireAccessibleProject(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        boolean managerAccess = project.getManager() != null && project.getManager().getId() != null
                && project.getManager().getId().equals(userId);
        boolean memberAccess = projectMemberRepository.existsByProject_IdAndUser_Id(projectId, userId);

        if (!managerAccess && !memberAccess) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User does not have access to this project");
        }

        return project;
    }
}