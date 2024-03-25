import { ProjectContext } from '@/layouts/ProjectLayout';
import React, { ReactElement, SyntheticEvent, useContext, useState } from 'react';
import Modal from 'react-modal';
import style from './IssuesTab.module.scss'
import { Issue } from '@/types/Issue';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { UserContext, api } from '@/pages/_app';
import axios from 'axios';
import IssueEditModal from './EditIssueModal';

import iconDescription from '../../../../public/description.png';
import iconAttachment from '../../../../public/attachment.png';
import iconTasks from '../../../../public/tasks.png';
import { formatDate } from '@/utils/formatDate';
import { ProjectFile } from '@/types/ProjectFile';
import { FullscreenImageContext } from '@/components/modals/FullscreenImageModal';
import NextImage from 'next/image';
import { IssueTask } from '@/types/IssueTask';
import EditIssueModalChecklist from './EditIssueModalChecklist';
import IssueEditModal2 from '@/components/modals/EditIssueModal2';

interface IssueItemProps extends Issue {
    issues: Issue[],
    descriptionExpanded: boolean,
    attachmentsExpanded: boolean,
    tasksExpanded: boolean,
    setIssues(issues: Issue[]): void;
    openCount: number;
    setOpenIssuesCount(count: number): void;
    closedCount: number;
    setClosedIssuesCount(count: number): void;
};

export default function IssueItem(props: IssueItemProps) {
    const { issues, setIssues, id, title, author, description, tasks, attachments, index, creationDate, labels, descriptionExpanded, attachmentsExpanded, tasksExpanded } = props;
    const [isDiscussionShown, showDiscussion] = useState(true);
    const [isEdited, setEditingMode] = useState(false);
    const [messages, setMessages] = useState([] as string[]);
    const [focused, setFocused] = useState(false);
    const { project } = useContext(ProjectContext);
    const user = useContext(UserContext);

    function handleClose() {
        setIssues(issues.filter(issue => issue.id !== id));
        props.setOpenIssuesCount(props.openCount - 1);
        props.setClosedIssuesCount(props.closedCount + 1);

        api.put(`/v1/projects/${project.id}/issues/${id}/status`, axios.toFormData({
            state: "RESOLVED"
        })).then(result => {
            console.log(result);
            toast.success(`Issue ${id} closed.`);
        });
    }

    function handleOpen() {
        setIssues(issues.filter(issue => issue.id !== id));
        props.setOpenIssuesCount(props.openCount + 1);
        props.setClosedIssuesCount(props.closedCount - 1);

        api.put(`/v1/projects/${project.id}/issues/${id}/status`, axios.toFormData({
            state: "DEFAULT"
        })).then(result => {
            console.log(result);
            toast.success(`Issue ${id} reopened.`);
        });
    }

    function handleEdit() {
        setFocused(true);
        setEditingMode(true);
    }

    function handleEditCompleted() {
        setFocused(false);
        setEditingMode(false);
    }

    function handleDelete(e: SyntheticEvent) {
        setFocused(true);

        function deleteIssue() {
            setIssues(issues.filter(issue => issue.id !== id));
            api.delete(`/v1/projects/${project.id}/issues/${id}`).then(() => toast.success(`Issue ${id} deleted.`));
        }

        if ((e.nativeEvent as MouseEvent).shiftKey) {
            deleteIssue();
            return;
        }

        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteIssue();
            }
            if (!isEdited)
                setFocused(false);
        });
    }

    function handleRefresh(update: Issue) {
        setIssues([...issues].map(issue => {
            if (issue.id !== id)
                return issue;

            console.log(`Updated:`);
            console.log(update);

            return update;
        }));
    }

    return <div className={style.issue + ' ' + (focused ? style.focused : '')}>
        <div className={style.container} onClick={handleEdit}>
            {/* <div className={style.num}>#{index}</div> */}
            <div className={style.content}>

                <p className={style.author}><span className={style.avatar} style={{ backgroundImage: `url(${author.avatar})` }} />{author?.name} • {formatDate(creationDate)}</p>

                <div className={style.header}>

                    <p className={style.title}>{title}
                        {labels.length > 0 && <>
                            <div className={style.labels}>
                                {labels.map(label => <span key={label.id} style={{ color: label.textColor, backgroundColor: label.backgroundColor }}>{label.title.toUpperCase()}</span>)}
                            </div>
                        </>}
                    </p>
                    {/* <p className={style.author}>by <span className={style.avatar} style={{backgroundImage: `url(${author.avatar})`}}/><strong>{author?.name}</strong> on {new Date(creationDate).toDateString()}</p> */}

                </div>

                {/* <p className={style.author}><span className={style.avatar} style={{ backgroundImage: `url(${author.avatar})` }} />{formatDate(creationDate)}</p> */}

                {description.length > 0 && descriptionExpanded && <IssueDescription description={description} />}
                {description.length > 0 && !descriptionExpanded && <NextImage src={iconDescription} width={14} height={14} alt='Description' className={style.descriptionIcon} />}

                {tasks.length > 0 && tasksExpanded && <IssueTasks issue={props} tasks={props.tasks} />}
                {tasks.length > 0 && !tasksExpanded && <NextImage src={iconTasks} width={14} height={14} alt='Tasks' className={style.tasksIcon} />}

                {attachments.length > 0 && attachmentsExpanded && <IssueAttachments attachments={attachments} />}
                {attachments.length > 0 && !attachmentsExpanded && <NextImage src={iconAttachment} width={14} height={14} alt="Attachments" className={style.attachmentsIcon} />}

            </div>
        </div>

        <div className={style.actionButtons}>
            <button className={style.checkmark} title="Mark as completed" onClick={handleClose} />
            <button className={style.edit} title="Edit issue" onClick={handleEdit}> </button>
            {/* <button title="Delete issue"> </button> */}
            <button className={style.delete} title="Delete issue" onClick={handleDelete}> </button>
        </div>

        {isEdited && <IssueEditModal2 action={(props.author.name === user.name && !props.resolved) ? 'edit' : 'view'} refresh={handleRefresh} handleComplete={handleClose} handleReopen={handleOpen} handleDelete={handleDelete} issue={props} isOpen={isEdited} onRequestClose={handleEditCompleted} />}

    </div>
}

function IssueDescription({ description }: { description: string }) {
    const rawLines = (description.includes('\n') ? description.trim().split('\n') : [description]);
    const lines = [] as ReactElement[];

    rawLines.forEach(line => {
        lines.push(<p>{line}</p>);
    });

    return <div className={style.description}>
        {lines}
        {/* <img className={style.picture} src='https://cdn.discordapp.com/attachments/977708721918586950/1085241983573950524/image.png' draggable={false} /> */}
    </div>;
}

function IssueTasks({ issue, tasks }: { issue: any, tasks: IssueTask[] }) {
    return <EditIssueModalChecklist action='view' issue={issue} preventNew={true} preventEdit={true} items={tasks} setItems={() => { }} />
}

function IssueAttachments({ attachments }: { attachments: ProjectFile[] }) {
    return <div className={style.attachments}>
        {attachments.map(att => <IssueAttachmentRender key={att.id} attachment={att} />)}
    </div>
}

function IssueAttachmentRender({ attachment }: { attachment: ProjectFile }) {
    const extension = attachment.name.substring(attachment.name.lastIndexOf('.') + 1).toLowerCase();
    const fullscreen = useContext(FullscreenImageContext);

    const [dimensions, setDimensions] = useState([128, 84]);

    function openFullscreen(e: SyntheticEvent) {
        e.stopPropagation();
        fullscreen.show(`${attachment.url}/preview`);
    }

    if (['png', 'jpg'].includes(extension)) {
        const image = new Image();
        image.onload = () => {
            const { width, height } = image;
            const multiplier = 84 / height;
            const modifiedWidth = width * multiplier;

            if (modifiedWidth !== dimensions[0] && modifiedWidth < 128) {
                setDimensions([modifiedWidth, 84]);
            }

            console.log(`[${width}, ${height}] to ${modifiedWidth}, ${height * multiplier}`);
        }
        image.src = `${attachment.url}/preview`;

        return <div className={style.item} style={{ width: `${dimensions[0]}px` }}>
            <div className={style.image} style={{ backgroundImage: `url(${attachment.url}/preview)` }} onClick={openFullscreen}>

            </div>
        </div>
    } else {
        return <div className={style.item}>

        </div>
    }
}