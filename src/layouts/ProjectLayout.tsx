import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import Sidebar from '@/components/Sidebar'
import { TabButton } from "@/components/Content"
import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { Project } from '@/types/Project'
import Account from '@/components/account/Account'
import { ToastContainer } from 'react-toastify'
import GlobalSearch from '@/components/GlobalSearch'
import { SearchContext, SearchContextProvider } from '@/contexts/SearchContext'
import { AppContext } from '@/contexts/ProjectsContext'
import ProjectSettingsModal from '@/components/ProjectSettingsModal'
import { useScroll } from '@/hooks/useScroll'
import style from '../components/Content.module.scss'
import { ProjectDetailsPanel } from '@/components/ProjectDetailsPanel'
import { EditProjectModal } from '@/components/modals/EditProjectModal'
import { TextMarkup } from '@/components/TextMarkup'
import { InviteCollaboratorModal } from '@/components/modals/InviteCollaboratorModal'
import Navbar from '@/components/navbar/Navbar'


const projectInfo = {
  project: { id: 'unknown', name: '' } as Project
};

export const ProjectContext = React.createContext(projectInfo);

export default function ProjectLayout(props: any) {
  const [project, setProject] = useState(projectInfo.project);
  const projectsContext = useContext(AppContext);
  const [isLoading, setLoading] = useState(true);
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  const router = useRouter();
  const { project: projectId } = router.query;

  const { Component } = props;

  projectInfo.project.id = projectId as string;

  const [isFixed, setFixed] = useState(false);

  const { handle: handleScroll } = useScroll();
  handleScroll(event => {
    const y = (event.target as Document).scrollingElement?.scrollTop || 0;

    if (y > 24) {
      if (!isFixed)
        setFixed(true);
    } else {
      if (isFixed)
        setFixed(false);
    }
  });

  useEffect(() => {

    const { project: newProjectId } = router.query;
    if (!newProjectId) {
      setProject({
        closedIssues: 0,
        openIssues: 0,
        files: [],
        group: { id: 0, icon: '', name: '' },
        id: '',
        latestBuild: 0,
        name: 'Loading...',
        icon: '',
        version: "0.1.0",
        latestFile: {},
        description: "",
        meta: { openIssues: 0, closedIssues: 0, builds: 0 }
      });
      return;
    }

    if (newProjectId === project.id && !isLoading)
      return;

    console.log(`${projectId} != ${newProjectId}, isLoading: ${isLoading}`);
    setLoading(true);

    // const baseData = projectsContext.projects.find(proj => proj.id === newProjectId);
    // if (baseData) {
    // setProject(baseData);
    // }

    axios.get(`/api/v1/projects/${newProjectId}`).then(result => {
      const json = result.data;
      // if (project.id !== json.id)
      // return;

      setProject(json);
      setLoading(false);

      props.setPageLoaded(true);
    });

  }, [router.query]);

  const { tab } = router.query;

  return (
    <>
      <ProjectContext.Provider value={{
        project
      }}>
        <Head>
          <title>{project.id} | {tab}</title>
        </Head>

        { /* @ts-ignore */}
        <div className='page-content' onScroll={handleScroll}>
          <Navbar key="navbar">
            <div className={style.projectName}>
              {project.icon && <img src={project.icon} />}
              <h3>{project.name || 'Loading...'} <img src={'/dropdown.png'} className={style.separator}/></h3>
            </div>
            <div style={{ display: 'flex' }}>
              <div style={{ display: 'inline-flex', flexWrap: 'nowrap' }}>
                {/* <TabButton tab="releases" content="Releases" /> */}
                <TabButton tab="builds" content="Builds" counter={project?.meta?.builds} />
                <TabButton tab="issues" content="Issues" counter={project?.meta?.openIssues} />
                <TabButton tab="milestones" content="Milestones" counter={project?.meta?.activeMilestones} />
                <TabButton tab="source" content="Source" />
              </div>
            </div>
          </Navbar>

          <div className={style.projectLayout}>
            <div className={style.projectTab}>
              {props.children}
            </div>
          </div>
        </div>

        {isSettingsOpen && <EditProjectModal open={true} close={() => setSettingsOpen(false)} project={project} />}
      </ProjectContext.Provider>
    </>
  )
}