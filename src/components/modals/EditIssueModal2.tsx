import { Issue } from "@/types/Issue";
import style from './EditIssueModal2.module.scss';
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
import { EditIssueModalFile } from "../tabs/issues/EditIssueModalFile";
import { FileUpload } from "@/types/FileUpload";
import { Modal } from "@/components/modals/Modal";
import EditIssueModalChecklist2 from "./EditIssueModalChecklist";
import { generateId } from "@/utils/generateId";
import Checkbox from "@/components/Checkbox";
import { DragOverlay } from "@/components/DragOverlay";
import { IssueTask } from "@/types/IssueTask";
import { EditIssueModalFile2 } from "./EditIssueModalFile2";

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

export default function IssueEditModal2(props: EditIssueModalProps) {
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

    const [labelsBoxPosition, setLabelsBoxPosition] = useState<[number, number]>();

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
            setLabelsBoxPosition(undefined);
        },
        filter(element, helper) {
            return element.textContent !== "Labels";
        },
    }, [labelsBoxPosition]);

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

    function handleFileUploadClick() {
        const input = document.createElement('input');
        input.type = "file";

        input.onchange = e => {
            const files = input.files;
            if (files === null)
                return;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                handleFileUpload(file);
            }
        }

        input.click();
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
        <div style={{ display: 'inline-flex', width: '100%', height: '100%', minHeight: '400px' }}>
            <div className={style.content} onDragOver={e => (setDraggingFile(true), e.preventDefault())} onPaste={handleFilePaste}>
                {isDraggingFile && <DragOverlay onDrop={handleFileUploadEvent} onDragEnd={() => setDraggingFile(false)} onDragLeave={() => setDraggingFile(false)} />}

                <textarea ref={titleRef} rows={1} className={style.title} value={title} onKeyDown={handleSendShortcut} disabled={props.action === 'view'} onInput={e => setTitle((e.target as HTMLInputElement).value)} placeholder="Enter a title for the issue" autoFocus={props.action === 'create'} />
                <p className={style.author}><a className={style.avatar} style={{ backgroundImage: `url(${props.issue.author.avatar})` }} /> <strong>{props.issue.author.name}</strong><span>•</span>{dateFormatted}</p>


                <div className={style.labels}>
                    <button className={style.addItem} onClick={e => setLabelsBoxPosition(labelsBoxPosition ? undefined : [e.clientX, e.currentTarget.offsetTop + 28])}>Labels</button>
                    <a className={style.separator}></a>
                    {labels.map(label => <button key={label.id} style={{ color: label.textColor, backgroundColor: label.backgroundColor }}>{label.title}</button>)}
                </div>

                <h3>Description</h3>
                {/* <hr style={props.issue.labels.length > 0 ? { margin: '4px' } : { marginTop: '12px', marginBottom: '4px' }} /> */}
                <textarea ref={descRef} rows={1} className={style.description} value={description} onKeyDown={handleSendShortcut} disabled={props.action === 'view'} onInput={e => setDescription((e.target as HTMLInputElement).value)} placeholder="Provide a description for more details" />

                {/* <div style={{display: 'flex'}}>
                    <div>
                        <h3>Assignees</h3>
                        <div className={style.assignees}>
                            <div className={style.assignee}>

                            </div>
                        </div>
                    </div>

                    <div style={{marginLeft: '28px'}}>
                        <h3>Labels</h3>
                        <div className={style.labels}>
                            {labels.map(label => <button key={label.id} style={{ color: label.textColor, backgroundColor: label.backgroundColor }}>{label.title}</button>)}
                        </div>
                    </div>

                </div> */}

                {(!props.issue.resolved || props.action === 'edit' || props.issue.tasks.length > 0) && <h3>Tasks</h3>}
                <EditIssueModalChecklist2 action={props.action} issue={props.issue} items={tasks} setItems={setTasks} updateIssue={props.refresh} preventNew={props.issue.resolved}></EditIssueModalChecklist2>


                <h3>Attachments</h3>
                <div className={style.attachments}>
                    {/* {files.length > 0 && <hr />} */}
                    <p className={style.hint}>Hint: You can drag and drop, as well as paste files here.</p>
                    <div className={style.items}>
                        {files.map(file => <EditIssueModalFile2 key={file.tempId || file.id} data={file} completeUpload={completeFileUpload} removeAttachment={removeAttachment} />)}
                    </div>

                    <button className={style.addItem} onClick={handleFileUploadClick}>+ Add Attachment</button>
                </div>

                {props.issue.resolved && <p className={style.closedIssueNotification}>This issue is closed. It can not be edited unless reopened.</p>}

                <button className={style.finish} onClick={e => handleClose(e, true)}>Save Changes</button>
            </div>

            {labelsBoxPosition && <div className={style.selectionBox} ref={labelsRef} style={{top: labelsBoxPosition[1] + 'px'}}>
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