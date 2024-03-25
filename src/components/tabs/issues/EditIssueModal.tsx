import { Issue } from "@/types/Issue";
import style from '../issues/EditIssueModal.module.scss';
import ReactModal from "react-modal";
import React, { FocusEvent, KeyboardEvent, MouseEvent, SyntheticEvent, useContext, useEffect, useRef, useState } from "react";
import { api } from "@/pages/_app";
import axios from "axios";
import { toast } from "react-toastify";
import { ProjectContext } from "@/layouts/ProjectLayout";
import Image from "next/image";
import { Label } from "@/types/Label";
import { formatDate } from "@/utils/formatDate";
import { AppContext } from "@/contexts/ProjectsContext";
import useAutosizedTextArea from "@/hooks/useAutosizedTextarea";
import { useFocus } from "@/hooks/useFocus";
import { EditIssueModalFile } from "./EditIssueModalFile";
import { FileUpload } from "@/types/FileUpload";
import { Modal } from "@/components/modals/Modal";
import EditIssueModalChecklist from "./EditIssueModalChecklist";
import { generateId } from "@/utils/generateId";
import Checkbox from "@/components/Checkbox";
import { DragOverlay } from "@/components/DragOverlay";
import { IssueTask } from "@/types/IssueTask";

interface EditIssueModalProps {
    action: "edit" | "create" | "view";
    issue: Issue;
    isOpen: boolean;
    filterClosed?: boolean;
    refresh?(data: Issue): void;
    refreshAll?(): void;
    insertIssue?(issue: Issue): void;
    handleReopen?(e: SyntheticEvent): void,
    handleComplete?(e: SyntheticEvent): void;
    handleDelete?(e: SyntheticEvent): void;
    onRequestClose?(e: MouseEvent | KeyboardEvent): void;
}

export default function IssueEditModal(props: EditIssueModalProps) {
    const [title, setTitle] = useState<string>();
    const [description, setDescription] = useState("");
    const [labels, setLabels] = useState(props.issue.labels);
    const [tasks, setTasks] = useState<({ isLoading?: boolean } & IssueTask)[]>(props.issue.tasks);
    const [isDraggingFile, setDraggingFile] = useState(false);
    const [files, setFiles] = useState<FileUpload[]>(props.issue.attachments?.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        isUploaded: true,
        url: file.url
    })) || []);

    const project = useContext(ProjectContext);
    const pageContext = useContext(AppContext);

    const [editingLabels, setEditingLabels] = useState(false);

    const { labels: availableLabels } = pageContext;
    const dateFormatted = formatDate(props.issue.creationDate);

    const titleRef = useRef<HTMLTextAreaElement>(null);
    const descRef = useRef<HTMLTextAreaElement>(null);
    const labelsRef = useRef<HTMLDivElement>(null);

    useAutosizedTextArea(titleRef.current, [title, props.isOpen]);
    useAutosizedTextArea(descRef.current, [description]);

    useFocus(labelsRef, {
        autoFocus: true,
        blur(ev) {
            setEditingLabels(false);
        },
        filter(element, helper) {
            return !element.classList.contains(style.labels);
        },
    }, [editingLabels]);

    function handleClose(e: MouseEvent | KeyboardEvent, save: boolean = false) {
        if (files.find(file => !file.isUploaded)) {
            alert('Files are not uploaded yet.');
            return;
        }

        if (props.onRequestClose !== undefined)
            props.onRequestClose(e);

        if (!save)
            return;

        if (props.action === 'edit') {
            api.put(`/v1/projects/${project.project.id}/issues/${props.issue.id}`, axios.toFormData({
                title, description, labels: JSON.stringify(labels.map(it => it.id))
            })).then(r => {
                toast.success('Updated issue!');
                if (props.refresh)
                    props.refresh(r.data);
            });
            return;
        }
        if (props.action === 'create') {
            const data: Issue = {
                ...props.issue,
                title: title as string, description
            }
            api.post(`/v1/projects/${project.project.id}/issues`, axios.toFormData({
                ...data,
                labels: JSON.stringify(labels.map(it => it.id)),
                attachments: JSON.stringify(files.map(upload => upload.id)),
                tasks: JSON.stringify(tasks.map(task => ({
                    text: task.text,
                    completed: task.completed
                })))
            })).then(r => {
                toast.success('New issue created!');
                if (props.insertIssue && !props.filterClosed)
                    props.insertIssue(r.data);
            });

            return;
        }
    }

    function handleSendShortcut(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            if (e.ctrlKey)
                handleClose(e, true);
            else if (e.target === titleRef.current)
                e.preventDefault();
        }
    }

    function toggleLabel(id: string) {
        setLabels(
            hasLabel(id) ? [...labels].filter(it => it.id !== id) : [...labels, (availableLabels.find(it => it.id === id) as Label)]
        );
    }

    function hasLabel(id: string): boolean {
        return labels.findIndex(it => it.id === id) !== -1;
    }

    function closeThen(e: MouseEvent | KeyboardEvent, cb?: (e: SyntheticEvent) => void) {
        handleClose(e, false);
        if (cb) setTimeout(() => cb(e), 300);
    }

    function handleFileUploadEvent(raw: SyntheticEvent) {
        console.log('Handling upload.');
        setDraggingFile(false);

        const native = raw.nativeEvent as DragEvent;
        const files = native.dataTransfer?.files as FileList;

        raw.preventDefault();

        const file = files.item(0) as File;
        handleFileUpload(file);
    }

    function handleFileUpload(file: File) {
        setFiles(prev => {
            return [...prev, {
                name: file.name,
                binary: file,
                isUploaded: false,
                size: file.size,
                tempId: Math.random()
            }]
        })
    }

    function handleFilePaste(raw: SyntheticEvent) {
        console.log('Handling file paste.');
        console.log(raw.nativeEvent);

        const event = raw.nativeEvent as ClipboardEvent;
        if (event.clipboardData?.files.length === 0) {
            console.log('There are no files :/');
            return;
        }

        const file = event.clipboardData?.files.item(0) as File;
        handleFileUpload(file);
    }

    function completeFileUpload(file: FileUpload) {
        if (props.action === 'edit') {
            api.put(`/v1/projects/${project.project.id}/issues/${props.issue.id}/attachments`, axios.toFormData({ id: file.id }));
        }
        setFiles(files => {
            return [
                ...files.filter(f => f.tempId !== file.tempId),
                file
            ]
        })
    }

    function removeAttachment(id: string) {
        setFiles(files => files.filter(file => file.id !== id));
        if (props.refresh) {
            props.refresh({
                ...props.issue,
                attachments: files.map(file => ({
                    ...file,
                    build: 0,
                    url: file.url as string,
                    downloadURL: `${file.url}/download`,
                    id: file.id as string,
                    name: file.name as string,
                    size: file.size as number,
                    uploadTimestamp: 0
                }))
            })
        }
    }

    useEffect(() => {
        if (!props.isOpen)
            return;

        setTitle(props.issue.title);
        setDescription(props.issue.description.length > 0 ? props.issue.description : props.action === "view" ? "No description provided" : "");
    }, [props.isOpen]);

    return <Modal
        isOpen={props.isOpen}
        overlayClassName={style.issueEditModalOverlay}
        className={style.issueEditModal + ' ' + (style[props.action])}
        preventScroll={true}
        onRequestClose={handleClose}
    >
        <div style={{display: 'inline-flex', width: '100%', height: '100%', minHeight: '400px'}}>
            <div className={style.content} onDragOver={e => (setDraggingFile(true), e.preventDefault())} onPaste={handleFilePaste}>
                {isDraggingFile && <DragOverlay onDrop={handleFileUploadEvent} onDragEnd={() => setDraggingFile(false)} onDragLeave={() => setDraggingFile(false)} />}

                <textarea ref={titleRef} rows={1} className={style.title} value={title} onKeyDown={handleSendShortcut} disabled={props.action === 'view'} onInput={e => setTitle((e.target as HTMLInputElement).value)} placeholder="Enter a title for the issue" autoFocus={props.action === 'create'} />
                <p className={style.author}><span>by </span><a className={style.avatar} style={{ backgroundImage: `url(${props.issue.author.avatar})` }} /> <strong>{props.issue.author.name} • </strong>{dateFormatted}</p>
                <div className={style.labels}>
                    {labels.map(label => <button key={label.id} style={{ color: label.textColor, backgroundColor: label.backgroundColor }}>{label.title}</button>)}
                </div>

                {/* <hr style={props.issue.labels.length > 0 ? { margin: '4px' } : { marginTop: '12px', marginBottom: '4px' }} /> */}

                <textarea ref={descRef} rows={1} className={style.description} value={description} onKeyDown={handleSendShortcut} disabled={props.action === 'view'} onInput={e => setDescription((e.target as HTMLInputElement).value)} placeholder="Provide a description for more details" />

                {(!props.issue.resolved || props.action === 'edit' || props.issue.tasks.length > 0) && <h3>Tasks</h3>}
                <EditIssueModalChecklist action={props.action} issue={props.issue} items={tasks} setItems={setTasks} updateIssue={props.refresh} preventNew={props.issue.resolved}></EditIssueModalChecklist>

                {files.length > 0 && <h3>Attachments</h3>}
                <div className={style.attachments}>
                    {/* {files.length > 0 && <hr />} */}
                    <div className={style.items}>
                        {files.map(file => <EditIssueModalFile key={file.tempId || file.id} data={file} completeUpload={completeFileUpload} removeAttachment={removeAttachment} />)}
                    </div>
                </div>

                {props.issue.resolved && <p className={style.closedIssueNotification}>This issue is closed. It can not be edited unless reopened.</p>}
            </div>

            <div className={style.actionButtons}>
                <button className={style.labels} onClick={() => setEditingLabels(!editingLabels)}>Labels</button>
                <button className={style.assignees} disabled>Assignees</button>

                <hr style={{ width: '150px' }} />
                {(!props.issue.resolved && (props.action === 'edit' || props.action === 'view')) && <button className={style.close} onClick={e => closeThen(e, props.handleComplete)}>Complete</button>}
                {(props.action === 'view' && props.issue.resolved) && <button className={style.close} onClick={e => closeThen(e, props.handleReopen)}>Reopen</button>}

                <hr style={{ width: '150px' } && (props.action === 'create' ? { marginTop: 'auto' } : {})} />
                {props.action === 'edit' && <button className={style.delete} onClick={props.handleDelete}>Delete</button>}

                {(props.action === 'edit' || props.action === 'create') && <button className={style.save} title="(CTRL+ENTER)" onClick={e => handleClose(e, true)}>{props.action === 'create' ? 'Create' : 'Save'}</button>}
            </div>

            {editingLabels && <div className={style.selectionBox} ref={labelsRef}>
                {availableLabels.map(label => (
                    <div key={label.id} onClick={() => toggleLabel(label.id)}>
                        <input type="checkbox" defaultChecked={hasLabel(label.id)} checked={hasLabel(label.id)} />
                        <button style={{ color: label.textColor, borderColor: label.textColor, backgroundColor: label.backgroundColor }}>{label.title}</button>
                    </div>
                ))}
            </div>}
        </div>

        {/* <hr /> */}
    </Modal>
}