import ReactModal from "react-modal";
import style from './CreateBuildModal2.module.scss';
import {ChangeEvent, DragEvent, SetStateAction, useContext, useEffect, useRef, useState} from "react";
import {api} from "@/pages/_app";
import {ProjectContext} from "@/layouts/ProjectLayout";
import axios from "axios";
import {Build} from "@/types/Build";
import {Issue} from "@/types/Issue";
import {FileUpload} from "@/types/FileUpload";
import {Modal} from "./Modal";
import Checkbox from "../Checkbox";
import {useTimeout} from "@/hooks/useTimeout";
import {DragOverlay} from "../DragOverlay";
import TextInput from "../TextInput";
import ReactDropdown from "react-dropdown";
import {useFetch} from "@/hooks/useFetch";
import {IssueSearchBox} from "../tabs/builds/IssueSearchBox";
import {InlineLoader} from "../loader/InlineLoader";
import iconFile from '../../../public/file.png';
import Image from "next/image";
import {Arrays} from "@/utils/Arrays";

interface CreateBuildModalProps {
    isOpen: boolean,

    createBuild(build: Build): void,

    close(): void
}

interface Change {
    id: string,
    type: "text" | "issue_ref",
    value: string | Issue,
    auto_generated: boolean
}

export function CreateBuildModal(props: CreateBuildModalProps) {
    const [step, setStep] = useState(1);
    const [artifacts, setArtifacts] = useState<FileUpload[]>([]);
    const [changelog, setChangelog] = useState<Change[]>([]);
    const [isAutolog, setIsAutolog] = useState(false);
    const [name, setName] = useState("");
    const [version, setVersion] = useState("");
    const project = useContext(ProjectContext);

    function handleContinue() {
        if (step === 1) {
            setStep(2);
            return;
        }

        if (artifacts.find(file => !file.isUploaded)) {
            alert('Files are not uploaded yet!');
            return;
        }

        if (!version.match(/(([0-9]+.[0-9]+)+|([0-9]+))(a|b|)/)) {
            alert('Version is not valid!');
            return;
        }

        const fd = axios.toFormData({
            files: JSON.stringify(artifacts.map(file => file.id)),
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
                        return {type: "text", text: item.value as string};
                    } else {
                        return {type: "issue_ref", issue: item.value as Issue}
                    }
                })
            });
            props.close();
        }).catch(() => {
            alert('Could not create a build.');
        });
    }

    return <Modal isOpen={props.isOpen} className={style.modal} onRequestClose={props.close}>
        {step === 1 && <CreateBuildModalStep1 {...props} name={name} setName={setName} version={version} setVersion={setVersion} artifacts={artifacts} setArtifacts={setArtifacts}/>}
        {step === 2 &&
            <CreateBuildModalStep2 {...props} isAutolog={isAutolog} setIsAutolog={setIsAutolog} changelog={changelog}
                                   setChangelog={setChangelog}/>}

        <div className={style.creationProgressWrapper}>
            <p>Step {step}</p>
            <div className={style.creationProgress}>
                <a className={`${style.checkpoint} ${step >= 1 ? style.current : ''}`}/>
                <a className={`${style.checkpoint} ${step >= 2 ? style.current : ''}`}/>
                <a className={`${style.checkpoint} ${step >= 3 ? style.current : ''}`}/>
                <div className={style.bar} style={{width: `${(step - 1) / 2 * 100}%`}}></div>

            </div>
        </div>
        {step === 2 && <button id={style.back} onClick={() => setStep(1)}>Back</button>}
        {step < 3 && <button id={style.submit} onClick={handleContinue}>Continue</button>}
    </Modal>
}

function CreateBuildModalStep1(props: CreateBuildModalProps & {
    name: string,
    setName(name: SetStateAction<string>): void,
    version: string,
    setVersion(version: SetStateAction<string>): void,
    artifacts: FileUpload[],
    setArtifacts: (state: SetStateAction<FileUpload[]>) => void
}) {
    const [isDraggingFile, setDraggingFile] = useState(false);
    const { name, setName, version, setVersion } = props;

    function handleUploadComplete(data: FileUpload) {
        props.setArtifacts(artifacts => artifacts.map(artifact => artifact.tempId === data.tempId ? data : artifact));
    }

    function handleFileRemove(id: number) {
        props.setArtifacts(artifacts => artifacts.filter(artifact => artifact.tempId !== id));
    }

    function handleFileDrop(event: DragEvent) {
        event.preventDefault();
        setDraggingFile(false);

        const native = event.nativeEvent;

        const fileList = native.dataTransfer?.files as FileList;
        native.preventDefault();

        const file = fileList.item(0) as File;
        props.setArtifacts([
            ...props.artifacts,
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

    return <>
        <h2>Create a version</h2>

        <section>
            <p>A meaningful name for this version: (Optional)</p>
            <TextInput id={style.buildname} valueProvider={name} valueSetter={setName} />

            <p>Specify a unique version number (e.g. 1.0.3) - a number that will be used by issues, roadmaps, board,
                etc.</p>
            <p>Previous version: 1.0.2</p>

            <TextInput valueProvider={version} valueSetter={setVersion} />
        </section>

        <hr/>

        <section onDragOver={e => (e.preventDefault(), setDraggingFile(true))}>
            {isDraggingFile &&
                <DragOverlay onDragEnd={() => setDraggingFile(false)} onDragLeave={() => setDraggingFile(false)}
                             onDrop={handleFileDrop}/>}

            <h2>Artifacts</h2>
            <div className={style.artifacts}>
                {props.artifacts.map(artifact =>
                    <BuildFile key={artifact.tempId || artifact.id} data={artifact}
                               completeUpload={handleUploadComplete} removeFile={handleFileRemove}/>)
                }
            </div>

            <button className={style.artifactUpload}>Upload a file</button>
        </section>
    </>
}

function CreateBuildModalStep2(props: CreateBuildModalProps & {
    isAutolog: boolean,
    setIsAutolog(flag: SetStateAction<boolean>): void,
    changelog: Change[],
    setChangelog(changelog: SetStateAction<Change[]>): void
}) {
    const [isIssueSelectionOpen, setIssueSelectionOpen] = useState(false);
    const {isAutolog, setIsAutolog} = props;

    const project = useContext(ProjectContext).project;
    const fetchAutolog = useFetch(api, api => api.get<Issue[]>(`/v1/projects/${project.id}/builds/autochangelog`).then(r => {
        props.setChangelog(changes => {
            const copy = [...changes];
            const mapped = r.data.map<Change>(issue => {
                return {
                    id: issue.id.toString(),
                    type: 'issue_ref',
                    value: issue,
                    auto_generated: true
                }
            })

            Arrays.pushAllIfAbsent(copy, mapped, (entry, value) => entry.id === value.id);
            return copy;
        });
    }));

    function addText() {
        const text = prompt("Text bitch:");
        if (text && text.trim().length > 0) {
            props.setChangelog(changes => [...changes, {
                id: Date.now().toString(),
                type: "text",
                value: text,
                auto_generated: false
            }]);
        }
    }

    function addIssues(issues: Issue[]) {
        props.setChangelog(changes => {
            const copy = [...changes];
            for (const issue of issues) {
                Arrays.pushIfAbsent(copy, {
                    id: issue.id.toString(),
                    type: "issue_ref",
                    value: issue,
                    auto_generated: false
                }, (entry: Change) => (
                    // @ts-ignore
                    entry.id == issue.id
                ));
            }

            return copy;
        });
    }

    function autoGenerate() {
        if (fetchAutolog.isFetching)
            return;

        if (isAutolog) {
            props.setChangelog(changelog => changelog.filter(change => !change.auto_generated))
        } else {
            fetchAutolog.fetch();
        }

        setIsAutolog(!isAutolog);
    }

    return <><h2>Create a changelog</h2>
        <section className={style.actionButtons}>
            <button onClick={addText}>+ Text</button>
            <button onClick={() => setIssueSelectionOpen(true)}>+ Issue Reference</button>
            <a className={style.separator}></a>
            <button onClick={autoGenerate}><Checkbox checked={isAutolog} style={{transform: 'translateY(1px)'}}/>Auto
                Generate
            </button>
        </section>

        {fetchAutolog.isFetching && <InlineLoader style={{marginTop: '10px'}}>Creating changelog...</InlineLoader>}

        <ul>
            {props.changelog.map(change => <li key={Math.random()}
                                               className={change.auto_generated ? style.autolog : ''}>
                {change.type === 'text' ? change.value as string : (change.value as Issue).title}
            </li>)}
        </ul>

        {isIssueSelectionOpen && <IssueSearchBox onCompleted={addIssues} close={() => setIssueSelectionOpen(false)}/>}
    </>
}

function BuildFile({data, completeUpload, removeFile}: {
    data: FileUpload,
    completeUpload: (newState: FileUpload) => void,
    removeFile: (id: number) => void
}) {
    const project = useContext(ProjectContext);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (data.isUploaded || data.state !== "INITIATED") return;

        completeUpload({
            ...data,
            state: "PROGRESS"
        });

        api.post(`/v1/projects/${project.project.id}/files`, axios.toFormData({
            name: data.name,
            file: data.binary as File
        }), {
            timeout: 10000,
            onUploadProgress(ev) {
                const progress = (ev.progress as number) * 100;
                setProgress(Math.round(progress));
            },
        }).then(r => {
            completeUpload({
                ...data,

                id: r.data.id,
                isUploaded: true,

                state: "SUCCESS"
            });
        }).catch(r => {
            completeUpload({
                ...data,
                state: "FAILED"
            });
        });

        console.log('yep. i should upload ' + data.name);
    }, []);

    function handleRemove() {
        removeFile(data.tempId as number);
    }

    return <article className={style.artifact}>
        <Image src={iconFile} alt="file icon"></Image>
        <div className={style.artifactInfo}>
            <p>{data.name}</p>
            {data.state === "PROGRESS" && <p className={style.indicatorProgress}>
                Upload in progress ({progress}%)
            </p>}
            {data.state === "SUCCESS" && <p className={style.indicatorCompleted}>File uploaded</p>}
            {data.state === "FAILED" && <p className={style.indicatorError}>File is too large</p>}
        </div>

        <button className={style.artifactDelete} onClick={handleRemove}>X</button>
    </article>
}