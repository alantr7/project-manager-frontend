import ReactModal from "react-modal";
import style from './CreateBuildModal.module.scss';
import { ChangeEvent, DragEvent, useContext, useEffect, useRef, useState } from "react";
import { api } from "@/pages/_app";
import { ProjectContext } from "@/layouts/ProjectLayout";
import axios from "axios";
import { Build } from "@/types/Build";
import { Issue } from "@/types/Issue";
import { FileUpload } from "@/types/FileUpload";
import { Modal } from "./Modal";
import Checkbox from "../Checkbox";
import { useTimeout } from "@/hooks/useTimeout";
import { DragOverlay } from "../DragOverlay";
import TextInput from "../TextInput";
import ReactDropdown from "react-dropdown";
import { useFetch } from "@/hooks/useFetch";
import { IssueSearchBox } from "../tabs/builds/IssueSearchBox";
import { InlineLoader } from "../loader/InlineLoader";

interface CreateBuildModalProps {
    isOpen: boolean,
    createBuild(build: Build): void,
    close(): void
}

function BuildChange({ data }: { data: string | Issue }) {
    if (typeof data == 'string') {
        return <li>{data}</li>
    }
    return <li><p>Issue <span className={style.issueReference}>{data.title}</span></p></li>
}

function BuildFile({ data, completeUpload, removeFile }: { data: FileUpload, completeUpload: (newState: FileUpload) => void, removeFile: (id: number) => void }) {
    const project = useContext(ProjectContext);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (data.isUploaded) return;

        const fd = new FormData();
        fd.append('name', data.name);
        fd.append('file', data.binary as File);

        api.post(`/v1/projects/${project.project.id}/files`, fd, {
            onUploadProgress(ev) {
                const progress = (ev.progress as number) * 100;
                setProgress(Math.round(progress));
            },
        }).then(r => {
            completeUpload({
                ...data,
                isUploaded: true,
                id: r.data.id
            });
        });

        console.log('yep. i should upload ' + data.name);
    }, []);

    function handleRemove() {
        removeFile(data.tempId as number);
    }

    return <div className={style.file}>
        <div className={style.info}>
            <p className={style.name}>{data.name}</p>
            <p className={style.size}>{data.isUploaded ? data.id : `Uploading... (${progress}%)`}</p>
        </div>
        <button className={style.removeFile} onClick={handleRemove}>X</button>
    </div>
}


interface Change {
    type: "text" | "issue_ref",
    value: string | Issue
}

export function CreateBuildModal(props: CreateBuildModalProps) {
    const [changelog, setChangelog] = useState<Change[]>([]);
    const [isDraggingFile, setDraggingFile] = useState(false);
    const [isReferencingIssue, setReferencingIssue] = useState(false);
    const [autolog, setAutolog] = useState(false);
    const [files, setFiles] = useState<FileUpload[]>([]);
    const project = useContext(ProjectContext);
    const [version, setVersion] = useState<string>("");
    const uploadRef = useRef<HTMLInputElement>(null);

    const fetchAutolog = useFetch(api, api => api.get<Issue[]>(`/v1/projects/${project.project.id}/builds/autochangelog`).then(r => {
        setChangelog(
            r.data.map(issue => {
                return {
                    type: 'issue_ref',
                    value: issue
                }
            })
        );
    }));

    function addChange(type: string) {
        if (!["text", "issue_ref", "auto_gen"].includes(type))
            return;

        if (type === 'text') {
            const value = prompt("text: ") as string;
            setChangelog([
                ...changelog,
                {
                    type,
                    value
                }
            ]);
            return;
        }

        if (type === 'issue_ref') {
            setReferencingIssue(true);
            return;
        }

        if (type === 'auto_gen') {
            fetchAutolog.fetch();
        }
    }

    const fetchTimeout = useTimeout(() => {
        addChange("auto_gen");
    }, { timeout: 500 });

    useEffect(() => {
        if (autolog) {
            fetchTimeout.start();
        } else {
            fetchTimeout.stop();
        }
    }, [autolog]);

    function addFile(ev: ChangeEvent) {
        const el = ev.target as HTMLInputElement;
        const elFiles = el.files as FileList;

        if (elFiles.length === 0)
            return;

        const file = elFiles[0] as File;

        setFiles([
            ...files,
            {
                tempId: Math.random() * 10000,
                name: file.name,
                size: file.size,
                isUploaded: false,
                binary: file
            }
        ])
    }

    function completeFileUpload(file: FileUpload) {
        setFiles(files => {
            return [
                ...files.filter(f => f.tempId !== file.tempId),
                file
            ]
        })
    }

    function createBuild() {
        if (files.find(file => !file.isUploaded)) {
            alert('Files are not uploaded yet!');
            return;
        }

        if (!version.match(/(([0-9]+.[0-9]+)+|([0-9]+))(a|b|)/)) {
            alert('Version is not valid!');
            return;
        }

        const fd = axios.toFormData({
            files: JSON.stringify(files.map(file => file.id)),
            changes: JSON.stringify(changelog.map(change => {
                if (change.type === "text")
                    return change.value;
                return (change.value as Issue).id;
            })),
            version: version.length > 0 ? version : project.project.version
        });

        api.post<Build>(`/v1/projects/${project.project.id}/builds`, fd).then(r => {
            props.createBuild({
                ...r.data, changelog: changelog.map(item => {
                    if (item.type === "text") {
                        return { type: "text", text: item.value as string };
                    } else {
                        return { type: "issue_ref", issue: item.value as Issue }
                    }
                })
            });
            props.close();
        }).catch(() => {
            alert('Could not create a build.');
        });
    }

    function handleUploadClick() {
        uploadRef.current?.click();
    }

    function handleDrop(native: DragEvent) {
        setDraggingFile(false);

        const fileList = native.dataTransfer?.files as FileList;
        native.preventDefault();

        const file = fileList.item(0) as File;
        setFiles([
            ...files,
            {
                tempId: Math.random() * 10000,
                name: file.name,
                size: file.size,
                isUploaded: false,
                binary: file,
                state: "INITIATED"
            }
        ])
    }

    function removeFile(tempId: number) {
        setFiles(files.filter(file => {
            if (file.tempId !== tempId)
                return true;

            api.delete(`/v1/projects/${project.project.id}/files/${file.id}`);
            return false;
        }));
    }

    function handleSetVersion(value: string) {
        if (value.length === 0) {
            setVersion("");
            return;
        }

        if (value.endsWith('..'))
            return;

        if (!value.match(/(([0-9]+(|(.[0-9]+)))+|([0-9]+))(a|b|)/))
            return;

        setVersion(value);
    }

    function addIssues(issues: Issue[]) {

        function filterAlreadyAdded(issue: Issue) {
            return changelog.find(change => {
                if (change.type === "text")
                    return true;

                const comparing = change.value as Issue;
                return comparing.id !== issue.id;
            }) === undefined
        }

        setChangelog([
            ...changelog,
            ...(issues.filter(filterAlreadyAdded).map(issue => {
                return {
                    type: "issue_ref",
                    value: issue
                }
            }) as Change[])
        ])
    }

    return <Modal isOpen={props.isOpen} overlayClassName='modal-overlay' className={style.modal} onRequestClose={props.close}>
        <div className={style.content} onDragOver={e => (e.preventDefault(), setDraggingFile(true))}>
            {isDraggingFile && <DragOverlay onDragEnd={() => setDraggingFile(false)} onDragLeave={() => setDraggingFile(false)} onDrop={handleDrop} />}

            <div className={style.changelog}>
                {/* <p className={style.title} style={{marginBottom: '24px'}}>Build Details</p> */}
                <div style={{ display: 'flex', marginRight: '20px' }}>
                    <div className={style.versioningItem} style={{flexGrow: 1}} >
                        <p>Build Name (optional)</p>
                        <TextInput className={style.titleInput} type="text" placeholder="" />
                    </div>
                    <div className={style.versioningItem}>
                        <p>Channel</p>
                        <ReactDropdown options={["Release", "Development"]} value="Release" className={style.dropdown} />
                    </div>
                    <div className={style.versioningItem}>
                        <p>Version</p>
                        {/* <ReactDropdown options={["v0.1.0"]} value={`v${project.project.version}`} className={style.dropdown} /> */}
                        <TextInput className={style.versionInput} type="text" valueProvider={version} valueSetter={handleSetVersion} placeholder={project.project.version} />
                    </div>
                </div>
                <hr />

                <p className={style.title}>Changelog</p>
                <div style={{ display: 'flex', marginTop: '4px' }}>
                    <button className={style.changelogAdd} onClick={() => addChange('text')}>+ Text</button>
                    <button className={style.changelogAdd} onClick={() => addChange('issue_ref')}>+ Issue Reference</button>
                    <div className={style.separator}></div>
                    <button className={style.changelogAdd} onClick={() => setAutolog(!autolog)}><Checkbox align="center" checked={autolog} />Auto Changelog</button>
                </div>

                <ul>
                    {changelog.map(item => <BuildChange key={Math.random()} data={item.value} />)}
                    {fetchAutolog.isFetching && <InlineLoader>Fetching automatic changelog...</InlineLoader>}
                </ul>
            </div>
            <div className={style.files}>
                <div className={style.header}>
                    <p className={style.title}>Files</p>
                    <button className={style.uploadFile} onClick={handleUploadClick}>Upload</button>
                </div>

                {files.map(file => <BuildFile data={file} key={file.tempId} completeUpload={completeFileUpload} removeFile={removeFile} />)}
                <input type="file" onChange={addFile} ref={uploadRef} />
            </div>
        </div>
        <button className={style.submit} onClick={createBuild}>Create Build</button>
        
        {isReferencingIssue && <IssueSearchBox onCompleted={addIssues} close={() => setReferencingIssue(false)} />}
    </Modal>
}