import { ProjectContext } from '@/layouts/ProjectLayout';
import React, { FocusEvent, KeyboardEvent, MouseEvent, ReactElement, ReactHTMLElement, SyntheticEvent, useContext, useEffect, useState } from 'react';
import style from '@/components/tabs/milestones/milestones.module.scss';
import { Issue } from '@/types/Issue';
import { useShortcut } from '@/hooks/useShortcut';
import Swal from 'sweetalert2';
import NewIssue from '../issues/NewIssue';
import IssueItem from '../issues/IssueItem';
import { UserContext, api } from '@/pages/_app';
import axios from 'axios';
import EditIssueModal from '../../../components/modals/EditIssueModal2';
import { InlineLoader } from '../../loader/InlineLoader';
import { InviteCollaboratorModal } from '../../modals/InviteCollaboratorModal';
import FilterDropdown from '../../FilterDropdown';
import FiltersPopup from '../issues/FiltersPopup';
import ViewPopup from '../issues/ViewPopup';
import { createURL } from '@/utils/createURL';
import Milestone from "@/components/tabs/milestones/Milestone";
import CreateMilestoneModal from "@/components/modals/milestones/CreateMilestone";
import {MilestoneType} from "@/types/Milestone";

export default function Milestones() {
    const { project } = useContext(ProjectContext);
    const user = useContext(UserContext);
    const [openCount, setOpenCount] = useState(project.openIssues);
    const [closedCount, setClosedCount] = useState(project.closedIssues);
    const [milestones, setMilestones] = useState<MilestoneType[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [filterClosed, setFilterClosed] = useState(false);
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);
    const [attachmentsExpanded, setAttachmentsExpanded] = useState(false);
    const [tasksExpanded, setTasksExpanded] = useState(false);
    const [isCreatingIssue, setCreatingIssue] = useState(false);

    const [filterLabels, setLabelsFilter] = useState<string[]>([]);
    const [filterAssignees, setAssigneesFilter] = useState<string[]>([]);

    function refreshIssues(projectId: string) {
        console.log(`Refreshing issues for ${projectId}`);
        const url = createURL(`/v1/projects/${projectId}/milestones`, {
            closed: filterClosed,
            labels: filterLabels.length > 0 ? filterLabels.join(';') : undefined,
            assignees: filterAssignees.length > 0 ? filterAssignees.join(';') : undefined
        });
        api.get(url).then(response => {
            setMilestones(response.data)
            setLoading(false);
        }).catch(() => setLoading(false));
    }

    function insertIssue(issue: MilestoneType) {
        setMilestones([
            issue,
            ...milestones
        ]);
        setOpenCount(openCount + 1);
    }

    useEffect(() => {
        setMilestones([]);
        setLoading(true);

        refreshIssues(project.id);
    }, [project, filterClosed, filterLabels, filterAssignees]);

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

    function handleFiltersUpdate(labels: string[], assignees: string[]) {
        setLabelsFilter(labels);
        setAssigneesFilter(assignees);
    }

    return <div className={style.issues}>
        {/* <NewIssue issues={issues} setIssues={setIssues}/> */}
        {isCreatingIssue && <CreateMilestoneModal
            action='create'
            isOpen={true}
            filterClosed={filterClosed}
            insertIssue={insertIssue}
            onRequestClose={handleCreationDone}
        />}

        <div className={style.filtersContainer}>
            <div className={style.filters}>
                <div className={style.state}>
                    <button className={`${style.open} ${!filterClosed && style.active}`} onClick={() => setFilterClosed(false)}>Active</button>
                    <button className={`${style.closed} ${filterClosed && style.active}`} onClick={() => setFilterClosed(true)}>Completed</button>
                    <a className={style.separator} />
                    {filterLabels.map(label => <button key={label} className={style.filter}>{label}</button>)}
                </div>
                <div className={style.buttons}>
                    <p style={{marginRight: '8px', fontFamily: "Rubik", color: "rgba(0, 0, 0, .6)", cursor: "default"}}>Showing {milestones.length} of {filterClosed ? 0 : project.meta?.activeMilestones}</p>
                    <a className={style.separator} />
                    <button className={style.newIssue} title='Create a new issue (SHIFT + N)' onClick={handleCreate}>Create Milestone</button>
                </div>
            </div>
        </div>

        <div className={style.table}>
            {/*{isLoading && <InlineLoader style={{ margin: '12px auto' }}>Please wait...</InlineLoader>}*/}
            {/*{!isLoading && issues.map(issue => <IssueItem issues={issues} openCount={openCount} setOpenIssuesCount={setOpenCount} closedCount={closedCount} setClosedIssuesCount={setClosedCount} setIssues={setIssues} descriptionExpanded={descriptionExpanded} attachmentsExpanded={attachmentsExpanded} tasksExpanded={tasksExpanded} key={issue.index} {...issue} />)}*/}

            {isLoading && <InlineLoader style={{ margin: '4px 0 0 32px' }}>Loading milestones...</InlineLoader>}
            {milestones.map(milestone => <Milestone key={milestone.id} data={milestone} />)}
        </div>
    </div>
}