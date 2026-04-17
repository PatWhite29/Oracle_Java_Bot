import React, { createContext, useContext, useState, useCallback } from 'react';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [userRole, setUserRole] = useState(null); // 'MANAGER' | 'MEMBER'

  const clearProject = useCallback(() => {
    setProject(null);
    setMembers([]);
    setUserRole(null);
  }, []);

  return (
    <ProjectContext.Provider value={{ project, setProject, members, setMembers, userRole, setUserRole, clearProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}
