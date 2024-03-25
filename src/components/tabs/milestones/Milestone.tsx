import {ProjectContext} from '@/layouts/ProjectLayout';
import React, {ReactElement, SyntheticEvent, useContext, useEffect, useState} from 'react';
import Modal from 'react-modal';
import style from './milestones.module.scss';
import {Issue} from '@/types/Issue';
import Swal from 'sweetalert2';
import {toast} from 'react-toastify';
import {UserContext, api} from '@/pages/_app';
import axios from 'axios';
import IssueEditModal from '../issues/EditIssueModal';

import iconDescription from '../../../../public/description.png';
import iconAttachment from '../../../../public/attachment.png';
import iconTasks from '../../../../public/tasks.png';
import {formatDate} from '@/utils/formatDate';
import {ProjectFile} from '@/types/ProjectFile';
import {FullscreenImageContext} from '@/components/modals/FullscreenImageModal';
import NextImage from 'next/image';
import {IssueTask} from '@/types/IssueTask';
import EditIssueModalChecklist from '../issues/EditIssueModalChecklist';
import IssueEditModal2 from '@/components/modals/EditIssueModal2';
import {IssueSearchBox} from "@/components/tabs/builds/IssueSearchBox";
import {MilestoneType} from "@/types/Milestone";

interface IssueItemProps {
    data: MilestoneType
}

export default function Milestone(props: IssueItemProps) {

    const [isDiscussionShown, showDiscussion] = useState(true);
    const [isEdited, setEditingMode] = useState(false);
    const [messages, setMessages] = useState([] as string[]);
    const [focused, setFocused] = useState(false);
    const [isSelectingIssues, setSelectingIssues] = useState(false);
    const [goals, setGoals] = useState<Issue[]>(props.data.issues);
    const {project} = useContext(ProjectContext);
    const user = useContext(UserContext);

    useEffect(() => {

    }, []);

    function handleClose() {

    }

    function handleEdit() {
        // setFocused(true);
        // setEditingMode(true);
    }

    function handleEditCompleted() {
        setFocused(false);
        setEditingMode(false);
    }

    function handleUpdateGoals(newGoals: Issue[]) {
        newGoals.forEach(goal => {
            if (goals.find(it => it.id === goal.id) === undefined) {
                api.post(`/v1/projects/${project.id}/milestones/${props.data.id}/goals`, axios.toFormData({
                    issue: goal.id
                })).then(r => {
                    setGoals(goals => goals.concat(goal));
                })
            }
        })
    }

    function handleAddGoal() {
        const input = prompt("What do you want ?!");
        if (input === null)
            return;

        api.post(`/v1/projects/${project.id}/issues`, axios.toFormData({
            title: input as string,
            description: ''
        })).then(r => {
            handleUpdateGoals([r.data]);
        })
    }

    function handleDelete(e: SyntheticEvent) {
        setFocused(true);

        function deleteIssue() {
            api.delete(`/v1/projects/${project.id}/milestones/${props.data.id}`).then(() => toast.success(`Milestone ${props.data.id} deleted.`));
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

    function setGoalState(id: number, state: "DEFAULT" | "PROGRESS" | "RESOLVED") {
        const nextState = state === "DEFAULT" ? "PROGRESS" : state === "PROGRESS" ? "RESOLVED" : "DEFAULT";
        api.put(`/v1/projects/${project.id}/issues/${id}/status`, axios.toFormData({
            state: nextState
        })).then(result => {
            console.log(result);
            toast.success(`Issue ${id} has changed its state.`);

            setGoals(goals => goals.map(goal => goal.id === id ? {
                ...goal,
                state: nextState
            } : goal));
        });
    }

    return <div className={style.issue + ' ' + (focused ? style.focused : '')}>
        <div className={style.container} onClick={handleEdit}>
            {/* <div className={style.num}>#{index}</div> */}
            <div className={style.content}>
                <div className={style.header}>

                    <p className={style.title}>{props.data.name} v{props.data.version}</p>
                    {/* <p className={style.author}>by <span className={style.avatar} style={{backgroundImage: `url(${author.avatar})`}}/><strong>{author?.name}</strong> on {new Date(creationDate).toDateString()}</p> */}

                </div>
                <p className={style.author}><span className={style.avatar}
                                                  style={{backgroundImage: `url(${user.avatar})`}}/>{user.name} • {formatDate(props.data.creationDate)}
                </p>

                <ul>
                    {goals.map(goal => {
                        // @ts-ignore
                        const stateStyle = style[goal.state];
                        const stateText = {["DEFAULT"]: "WAITING", ["PROGRESS"]: "IN PROGRESS", ["RESOLVED"]: "COMPLETED"}[goal.state];
                        return <li key={goal.id}>
                            <div className={style.goal} onClick={() => setGoalState(goal.id, goal.state)}><a className={`${style.status} ${stateStyle}`}>{stateText}</a>{goal.title}
                            </div>
                        </li>
                    })}
                </ul>

                <button onClick={() => setSelectingIssues(true)}>Add Issue</button>
                <button onClick={handleAddGoal}>Add Goal</button>

                {/* <p className={style.author}><span className={style.avatar} style={{ backgroundImage: `url(${author.avatar})` }} />{formatDate(creationDate)}</p> */}

            </div>
        </div>

        <div className={style.actionButtons}>
            <button className={style.checkmark} title="Mark as completed" onClick={handleClose}/>
            <button className={style.edit} title="Edit issue" onClick={handleEdit}></button>
            {/* <button title="Delete issue"> </button> */}
            <button className={style.delete} title="Delete issue" onClick={handleDelete}></button>
        </div>
        {isSelectingIssues &&
            <IssueSearchBox issues={goals} onCompleted={handleUpdateGoals} close={() => setSelectingIssues(false)}/>}
    </div>
}