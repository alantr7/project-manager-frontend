import {DragEvent, MouseEvent, SyntheticEvent, useContext, useEffect, useState} from "react";
import style from "./Sidebar.module.scss"
import {ProjectContext} from "@/layouts/ProjectLayout";
import {NextRouter, Router, useRouter} from "next/router";
import {useAuth} from "@/hooks/useAuth";
import {useShortcut} from "@/hooks/useShortcut";
import axios from "axios";
import {AppContext} from "@/contexts/ProjectsContext";
import Image from "next/image";

import iconBoard from '../../public/issue-board.png';
import iconMilestone from '../../public/icon-milestone.png';
import iconActivities from '../../public/recent.png';
import iconAddProject from '../../public/add-project.png';
import iconAddMember from '../../public/user.png';
import iconRename from '../../public/edit.png';
import iconLeave from '../../public/logout.png';
import iconDelete from '../../public/delete.png';
import {Group} from "@/types/Group";
import {api, UserContext} from "@/pages/_app";
import {Project} from "@/types/Project";
import Swal from "sweetalert2";
import {ProjectContextMenu} from "./context_menus/ProjectContextMenu";
import {EditProjectModal} from "./modals/EditProjectModal";
import {CreateProjectModal} from "./modals/CreateProjectModal";
import {toast} from "react-toastify";
import {ContextMenu, MenuItem} from "./ContextMenu";
import {InviteCollaboratorModal} from "./modals/InviteCollaboratorModal";
import {conditional} from "@/utils/conditional";
import {ProjectGroupContextMenu} from "./context_menus/ProjectGroupContextMenu";
import {createPortal} from "react-dom";
import {useFetch} from "@/hooks/useFetch";
import {InlineLoader} from "@/components/loader/InlineLoader";
import {useApp} from "@/hooks/useApp";
import {ManageMembersModal} from "@/components/modals/ManageMembersModal";

interface SidebarPageProps {
    router?: NextRouter;
    url?: string;
    text: string;
    icon: string;

    onClick?(): void
}

function SidebarPage(props: SidebarPageProps) {
    return <div
        className={style.project + ' ' + style.page + ' ' + (props.router?.asPath === `${props.url}` ? style.selected : '')}
        onClick={() => {
            if (props.router) {
                props.router?.push(props.url as string)
            } else {
                props.onClick && props.onClick();
            }
        }}>
        <p className={style.projectIcon}
           style={{backgroundImage: `url(${props.icon})`, backgroundColor: 'transparent', backgroundSize: '18px'}}></p>
        <p className={style.name}>{props.text}</p>
    </div>
}

function SidebarGroup({currentProject, group, navigate, handleCreateProject, setProjects}: {
    currentProject: string | null | undefined,
    group: Group,
    navigate: (url: string) => void,
    handleCreateProject: (group: Group) => void,
    setProjects: (groups: Group[]) => void
}) {
    const [isDraggedOver, setDraggedOver] = useState(false);
    const [isExpanded, setExpanded] = useState(true);
    const [contextMenuPosition, setContextMenuPosition] = useState<[number, number]>();
    const [name, setName] = useState(group.name);
    const {groups, workspace} = useContext(AppContext);

    function handleDragOver(e: DragEvent, group: Group) {
        e.preventDefault();
        setDraggedOver(true);
    }

    function handleDragOut(e: DragEvent) {
        console.log(e.target);
        console.log(e.currentTarget);
        console.log(e.relatedTarget);

        if (e.relatedTarget !== null && !(e.relatedTarget as HTMLElement).classList.contains(style.group) && !(e.relatedTarget as HTMLElement).classList.contains(style.sidebar))
            return;

        console.log(e);
        setDraggedOver(false);
    }

    function handleDragEnd() {
        setDraggedOver(false);
    }

    function handleDrag(e: DragEvent, group: Group) {
        console.log(e);
        const projectId = e.dataTransfer.getData('text');
        const previousGroupId = groups.map(g => g.projects).flat().find(it => it.id === projectId)?.group.id;

        setDraggedOver(false);

        if (previousGroupId === group.id)
            return;

        api.put<Project>(`/v1/projects/${projectId}`, axios.toFormData({group: group.id})).then(r => {
            const updated = [...groups];
            const updatedGroup = updated.find(g => g.id === group.id);

            const previousGroup = updated.find(g => g.id === previousGroupId);

            if (previousGroup)
                previousGroup.projects = previousGroup.projects.filter(it => it.id !== projectId);

            if (updatedGroup) {
                updatedGroup.projects = [...updatedGroup.projects, r.data];
            }

            setProjects(updated);
        })
    }

    function handleRenameGroup() {
        const result = prompt("Enter a new name:");
        if (result)
            setName(result);
    }

    function handleDeleteGroup() {
        Swal.fire({
            title: 'Are you sure?',
            text: "All projects from this group will move to default-group",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (!result.isConfirmed) {
                return;
            }

            api.delete(`/v1/workspaces/${workspace.weak_id}/groups/${group.id}`).then(r => {
                const defaultGroup = groups.find(it => it.id === 0);
                if (!defaultGroup)
                    return;

                setProjects([
                    ...groups.filter(it => it.id !== group.id && it.id !== 0),
                    {
                        ...defaultGroup,
                        projects: [
                            ...group.projects,
                            ...defaultGroup.projects
                        ]
                    }
                ]);
            })
        });
    }

    function handleContextMenu(e: MouseEvent) {
        e.preventDefault();
        setContextMenuPosition([e.clientX, e.clientY]);
    }

    function handleDeleteProject(project: Project) {
        setProjects(groups.map(group => {
            if (group.id !== project.group.id)
                return group;

            return {
                ...group,
                projects: (group.projects as Project[]).filter(proj => proj.id !== project.id)
            }
        }));
    }

    return <div
        className={`${style.group} ${conditional(!isExpanded, style.folded)} ${conditional(contextMenuPosition, style.highlighted)}`}
        onContextMenu={handleContextMenu}
        onDragOver={e => handleDragOver(e, group)} onDrop={e => handleDrag(e, group)} draggable={true}>
        <p className={style.groupName} onClick={() => setExpanded(!isExpanded)}>{name}</p>
        <div className={style.groupActions}>

        </div>

        {isExpanded && group.projects.map(project => <SidebarProject key={project.id}
                                                                     selected={currentProject === project.id}
                                                                     groups={groups} setGroups={setProjects}
                                                                     project={project} navigate={navigate}
                                                                     deleteProject={() => handleDeleteProject(project)}></SidebarProject>)}

        {contextMenuPosition && <ProjectGroupContextMenu
            left={contextMenuPosition[0]}
            top={contextMenuPosition[1]}
            createProject={() => handleCreateProject(group)}
            delete={handleDeleteGroup}
            rename={handleRenameGroup}
            close={() => setContextMenuPosition(undefined)}
        />}

        {isDraggedOver && <div className={style.dragOverlay} onDragLeave={handleDragOut} onDragEnd={handleDragEnd}>
            {/* {group.projects.map(() => {            
                return <div className={style.dragInsert}>
                    <div onDragEnter={() => {}}></div>
                    <div></div>
                </div>
            })} */}
        </div>}
    </div>
}

function SidebarProject({project, selected, navigate, deleteProject, groups, setGroups}: {
    project: Project,
    selected: boolean,
    navigate: (url: string) => void,
    deleteProject(): void,
    groups: Group[],
    setGroups: (groups: Group[]) => void
}) {

    const router = useRouter();
    const app = useContext(AppContext);
    const [isContextMenuOpen, setContextMenuOpen] = useState(false);
    const [isSettingsOpen, setSettingsOpen] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState<[number, number]>([0, 0]);

    function handleDragStart(e: DragEvent) {
        e.dataTransfer.setData('text', project.id);
    }

    const setProject = (id: string): void => {
        if (selected)
            return;

        const tab = router.query.tab || (router.asPath === `/w/${app.workspace.weak_id}/board` ? 'issues' : 'builds');
        navigate(`/w/${app.workspace.weak_id}/p/${id}/${tab}`);
    };

    function handleContextMenu(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        setContextMenuPosition([
            e.clientX,
            e.pageY
        ]);
        setContextMenuOpen(true);
    }

    function handleEditProject() {
        setSettingsOpen(true);
    }

    function handleCategoryChange(category: number) {
        const projectId = project.id;
        const previousGroupId = groups.map(g => g.projects).flat().find(it => it.id === projectId)?.group.id;

        if (previousGroupId === category)
            return;

        api.put<Project>(`/v1/projects/${projectId}`, axios.toFormData({group: category})).then(r => {
            const updated = [...groups];
            const updatedGroup = updated.find(g => g.id === category);

            const previousGroup = updated.find(g => g.id === previousGroupId);

            if (previousGroup)
                previousGroup.projects = previousGroup.projects.filter(it => it.id !== projectId);

            if (updatedGroup) {
                updatedGroup.projects = [...updatedGroup.projects, r.data];
            }

            setGroups(updated);
        })
    }

    function handleDeleteProject() {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it.'
        }).then((result) => {
            if (result.isConfirmed) {
                api.delete(`/v1/projects/${project.id}`)
                    .then(() => {
                        deleteProject();
                        toast.success(`Deleted project ${project.name}`);
                    });
            }
        });
    }

    return <div
        className={style.project + ' ' + (selected ? style.selected : '') + ' ' + (isContextMenuOpen ? style.highlighted : '')}
        onContextMenu={handleContextMenu}
        onClick={() => setProject(project.id)} draggable={true} onDragStart={handleDragStart}>
        <p className={style.projectIcon} style={{backgroundImage: `url(${project.icon})`}}></p>
        <p className={style.name}>{project.name}</p>

        {isContextMenuOpen && createPortal(
            <ProjectContextMenu editProject={handleEditProject} setCategory={handleCategoryChange}
                                deleteProject={handleDeleteProject} left={contextMenuPosition[0]}
                                top={contextMenuPosition[1]} close={() => setContextMenuOpen(false)}/>,
            document.body
        )}
        {isSettingsOpen && <EditProjectModal open={true} project={project} close={() => setSettingsOpen(false)}/>}
    </div>

}

function Sidebar({navigate, setProjects, inviteCollaborator}: {
    navigate: (url: string) => void,
    setProjects: (groups: Group[]) => void,
    inviteCollaborator: () => void
}) {

    const user = useContext(UserContext);
    const {groups, workspace} = useContext(AppContext);
    const router = useRouter();

    const [currentProject, setCurrentProject] = useState<string | null | undefined>();
    const [selectedGroup, setSelectedGroup] = useState<Group>();

    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [isInvitingCollaborator, setIsInvitingCollaborator] = useState(false);

    const [sidebarContextPosition, setSidebarContextPosition] = useState<[number, number]>();

    useEffect(() => {
        if (!router.route.startsWith('/w/[workspace]/p/')) {
            setCurrentProject(null);
            return;
        }

        const {project} = router.query;
        setCurrentProject(project?.toString());
    }, [router]);

    function handleCreateProject(group: Group) {
        setSelectedGroup(group);
        setIsCreatingProject(true);
    }

    function handleCompleteProjectCreation(project: Project) {
        const updated = [...groups];
        const updatedGroup = updated.find(g => g.id === project.group.id);

        if (updatedGroup) {
            updatedGroup.projects = [...updatedGroup.projects, project];
        }

        setProjects(updated);
        navigate(`/project/${project.id}/issues`);
    }

    function handleCreateGroup() {
        const name = prompt('Name for a group:');
        if (!name)
            return;

        api.post<Group>(`/v1/workspaces/${workspace.weak_id}/groups`, axios.toFormData({name})).then(r => {
            setProjects([
                ...groups, {
                    ...r.data,
                    projects: []
                }
            ]);
        })
    }

    function leaveWorkspace() {
        api.delete(`/v1/workspaces/${workspace.weak_id}/members/${user.id}`).then(r => {
            document.location.href = '/';
        }).catch((r) => {
            if (r.response.status === 403) {
                Swal.fire({title: "Error occurred", text: "You can not leave the workspace as you are its owner.", icon: "error"});
                return;
            }
        });
    }

    return <>
        <div className={style.sidebar}>

            <WorkspaceButton
                createProject={() => (setSelectedGroup(groups.find(group => group.id === 0)), setIsCreatingProject(true))}
                inviteCollaborator={() => setIsInvitingCollaborator(true)}
                leaveWorkspace={leaveWorkspace}
            />

            <div className={style.group} style={{marginTop: '24px', marginBottom: '0'}}>
                <SidebarPage router={router} text="Issue Board" icon={iconBoard.src}
                             url={`/w/${workspace.weak_id}/board`}/>
                <SidebarPage router={router} text="Milestones" icon={iconMilestone.src} url="#"/>
                <SidebarPage router={router} text="Activity (W.I.P)" icon={iconActivities.src}
                             url={`/w/${workspace.weak_id}/activity`}/>
            </div>

            <div className={style.projects} onContextMenu={() => setSidebarContextPosition([0, 0])}>
                <button className={style.createGroup} onClick={handleCreateGroup}>Create</button>
                {Object.entries(groups).map(([key, group]) => <SidebarGroup currentProject={currentProject}
                                                                            group={group}
                                                                            handleCreateProject={handleCreateProject}
                                                                            navigate={navigate}
                                                                            setProjects={setProjects} key={group.id}/>)}
            </div>

        </div>

        {isCreatingProject &&
            <CreateProjectModal group={selectedGroup} groups={groups} close={() => setIsCreatingProject(false)}
                                complete={handleCompleteProjectCreation}/>}
        {isInvitingCollaborator && <ManageMembersModal close={() => setIsInvitingCollaborator(false)}/>}
    </>;

}

function WorkspaceButton(props: { createProject(): void, inviteCollaborator(): void, leaveWorkspace(): void }) {
    const [isExpanded, setExpanded] = useState(false);
    const router = useRouter();
    const {workspaces, workspace: current} = useContext(AppContext);

    function handleCreateWorkspace() {
        const name = prompt("Name for the workspace:", undefined);
        if (name === undefined || name === null)
            return;

        api.post(`/v1/workspaces`, axios.toFormData({name}));
    }

    function setWorkspace(id: string) {
        setTimeout(() => {
            setExpanded(false);
        }, 500);
        router.push(`/w/${id}/board`);
    }

    return <div className={style.workspace}>
        <h3 onClick={() => setExpanded(true)}>{current.name}</h3>
        {isExpanded &&
            <ContextMenu className={style.workspaceContextMenu} isVisible={isExpanded} close={() => setExpanded(false)}
                         left="36px" top="72px">
                <MenuItem icon={iconAddProject.src} className={style.item}
                          onClick={() => (props.createProject(), setExpanded(false))}>Create Project</MenuItem>
                <MenuItem icon={iconAddMember.src} className={style.item}
                          onClick={() => (props.inviteCollaborator(), setExpanded(false))}>Manage Members</MenuItem>
                <MenuItem icon={iconRename.src} className={style.item} iconSize={["16px", "16px"]}>Change
                    Icon</MenuItem>
                <MenuItem icon={iconRename.src} className={style.item} iconSize={["16px", "16px"]}>Rename
                    Workspace</MenuItem>
                <hr/>
                <MenuItem icon={iconLeave.src} className={style.item}
                          onClick={() => (props.leaveWorkspace(), setExpanded(false))} iconSize={["16px", "16px"]}>Leave
                    Workspace</MenuItem>
                <MenuItem icon={iconDelete.src} className={`${style.item} ${style.delete}`} iconSize={["16px", "16px"]}>Delete
                    Workspace</MenuItem>
                <hr/>
                <section>
                    {workspaces.map(workspace => <div key={workspace.weak_id}
                                                      className={`${style.workspace} ${current.weak_id === workspace.weak_id ? style.active : ''}`}
                                                      onClick={() => setWorkspace(workspace.weak_id)}>
                        <img src={"https://dercraft.net/img/logo.webp"}/>
                        <div>
                            <p>{workspace.name}</p>
                            { /* @ts-ignore */}
                            <p className={style.collabs}>{workspace.collaborators.length} collaborators</p>
                        </div>
                    </div>)}
                </section>
                <button className={style.createWorkspace} onClick={handleCreateWorkspace}>Create Workspace</button>
            </ContextMenu>}
    </div>
}

export default Sidebar;