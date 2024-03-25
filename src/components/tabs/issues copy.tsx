import { ProjectContext } from '@/layouts/ProjectLayout';
import React, { FocusEvent, KeyboardEvent, MouseEvent, ReactElement, ReactHTMLElement, SyntheticEvent, useContext, useEffect, useState } from 'react';
import style from '@/components/tabs/issues/IssuesTab.module.scss'
import { Issue } from '@/types/Issue';
import { useShortcut } from '@/hooks/useShortcut';
import Swal from 'sweetalert2';
import NewIssue from './issues/NewIssue';
import IssueItem from './issues/IssueItem';
import { UserContext, api } from '@/pages/_app';
import axios from 'axios';
import EditIssueModal from './issues/EditIssueModal';
import { InlineLoader } from '../loader/InlineLoader';
import { InviteCollaboratorModal } from '../modals/InviteCollaboratorModal';
import FilterDropdown from '../FilterDropdown';

export default function Issues() {
    const { project } = useContext(ProjectContext);
    const user = useContext(UserContext);
    const [openCount, setOpenCount] = useState(project.openIssues);
    const [closedCount, setClosedCount] = useState(project.closedIssues);
    const [issues, setIssues] = useState([] as Issue[]);
    const [isLoading, setLoading] = useState(true);
    const [filterClosed, setFilterClosed] = useState(false);
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);
    const [attachmentsExpanded, setAttachmentsExpanded] = useState(false);
    const [tasksExpanded, setTasksExpanded] = useState(false);
    const [isCreatingIssue, setCreatingIssue] = useState(false);

    function refreshIssues(projectId: string) {
        console.log(`Refreshing issues for ${projectId}`);
        api.get(`/v1/projects/${projectId}/issues?closed=${filterClosed}`).then(response => {
            setIssues(response.data)
            setLoading(false);
        }).catch(() => setLoading(false));
    }

    function insertIssue(issue: Issue) {
        setIssues([
            issue,
            ...issues
        ]);
        setOpenCount(openCount + 1);
    }

    useEffect(() => {
        setIssues([]);
        setLoading(true);

        refreshIssues(project.id);
    }, [project, filterClosed]);

    useEffect(() => {
        setOpenCount(project.openIssues);
        setClosedCount(project.closedIssues);
    }, [project]);

    useEffect(() => {
        setDescriptionExpanded((window.localStorage.getItem('issues.showDescriptions') || 'false') === 'true');
        setTasksExpanded((window.localStorage.getItem('issues.showTasks') || 'false') === 'true');
        setAttachmentsExpanded((window.localStorage.getItem('issues.showAttachments') || 'false') === 'true');
    }, []);

    useEffect(() => {
        if (!isLoading) {
            window.localStorage.setItem('issues.showDescriptions', descriptionExpanded.toString());
            window.localStorage.setItem('issues.showTasks', tasksExpanded.toString());
            window.localStorage.setItem('issues.showAttachments', attachmentsExpanded.toString());
        }
    }, [descriptionExpanded, attachmentsExpanded]);

    useShortcut('N').handle(() => setCreatingIssue(true));

    function handleCreate() {
        setCreatingIssue(true);
    }

    function handleCreationDone() {
        setCreatingIssue(false);
    }

    return <div className={style.issues}>
        {/* <NewIssue issues={issues} setIssues={setIssues}/> */}
        {isCreatingIssue && <EditIssueModal
            action='create'
            issue={{ author: user, creationDate: new Date().toString(), description: '', title: '', id: 0, index: 0, labels: [], attachments: [], tasks: [] }}
            isOpen={true}
            filterClosed={filterClosed}
            insertIssue={insertIssue}
            onRequestClose={handleCreationDone}
        />}

        <div className={style.filtersContainer}>
            <div className={style.filters}>
                <p className={style.status}>
                    <span className={style.open + ' ' + (!filterClosed ? style.active : '')} onClick={() => setFilterClosed(false)}>Open ({openCount})</span>
                    <span className={style.closed + ' ' + (filterClosed ? style.active : '')} onClick={() => setFilterClosed(true)}>Closed ({closedCount})</span>
                    <FilterDropdown text='Issue State' options={["Open", "Closed"]} />
                </p>
                <div className={style.buttons}>
                    <button title="Show/Hide descriptions" className={style.showDescriptions + ' ' + (descriptionExpanded ? style.active : '')} onClick={() => setDescriptionExpanded(!descriptionExpanded)}></button>
                    <button title="Show/Hide tasks" className={style.showTasks + ' ' + (tasksExpanded ? style.active : '')} onClick={() => setTasksExpanded(!tasksExpanded)}></button>
                    <button title="Show/Hide attachments" className={style.showAttachments + ' ' + (attachmentsExpanded ? style.active : '')} onClick={() => setAttachmentsExpanded(!attachmentsExpanded)}></button>
                    <a className={style.separator} />
                    <button className={style.sort}></button>
                    <button className={style.filter}></button>
                    <a className={style.separator} />
                    <button className={style.newIssue} title='Create a new issue (SHIFT + N)' onClick={handleCreate}>Create Issue</button>
                </div>
            </div>
        </div>

        <div className={style.table}>
            {isLoading && <InlineLoader style={{ margin: '12px auto' }}>Please wait...</InlineLoader>}
            {!isLoading && issues.map(issue => <IssueItem issues={issues} openCount={openCount} setOpenIssuesCount={setOpenCount} closedCount={closedCount} setClosedIssuesCount={setClosedCount} setIssues={setIssues} descriptionExpanded={descriptionExpanded} attachmentsExpanded={attachmentsExpanded} tasksExpanded={tasksExpanded} key={issue.index} {...issue} />)}
        </div>
    </div>
}