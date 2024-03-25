import {Issue} from "@/types/Issue";
import style from './CreateMilestone.module.scss';
import ReactModal from "react-modal";
import React, {
    FocusEvent,
    KeyboardEvent,
    MouseEvent,
    SyntheticEvent,
    useContext,
    useEffect,
    useRef,
    useState
} from "react";
import {api} from "@/pages/_app";
import axios from "axios";
import {toast} from "react-toastify";
import {ProjectContext} from "@/layouts/ProjectLayout";
import Image from "next/image";
import {Label} from "@/types/Label";
import {formatDate} from "@/utils/formatDate";
import {AppContext} from "@/contexts/ProjectsContext";
import useAutosizedTextArea from "@/hooks/useAutosizedTextarea";
import {useFocus} from "@/hooks/useFocus";
import {EditIssueModalFile} from "../../tabs/issues/EditIssueModalFile";
import {FileUpload} from "@/types/FileUpload";
import {Modal} from "@/components/modals/Modal";
import EditIssueModalChecklist2 from "../EditIssueModalChecklist";
import {generateId} from "@/utils/generateId";
import Checkbox from "@/components/Checkbox";
import {DragOverlay} from "@/components/DragOverlay";
import {IssueTask} from "@/types/IssueTask";
import {EditIssueModalFile2} from "../EditIssueModalFile2";
import {MilestoneType} from "@/types/Milestone";

interface EditIssueModalProps {
    action: "edit" | "create" | "view";
    isOpen: boolean;
    filterClosed?: boolean;

    refresh?(data: Issue): void;

    refreshAll?(): void;

    insertIssue?(issue: MilestoneType): void;

    handleReopen?(e: SyntheticEvent): void,

    handleComplete?(e: SyntheticEvent): void;

    handleDelete?(e: SyntheticEvent): void;

    onRequestClose?(e: MouseEvent | KeyboardEvent): void;
}

export default function CreateMilestoneModal(props: EditIssueModalProps) {
    const [name, setName] = useState<string>();
    const project = useContext(ProjectContext);
    const pageContext = useContext(AppContext);

    const [labelsBoxPosition, setLabelsBoxPosition] = useState<[number, number]>();

    const {labels: availableLabels} = pageContext;

    const titleRef = useRef<HTMLTextAreaElement>(null);

    function handleClose(e: MouseEvent | KeyboardEvent, save: boolean = false) {
        if (props.onRequestClose !== undefined)
            props.onRequestClose(e);

        if (!save)
            return;

        api.post(`/v1/projects/${project.project.id}/milestones`, axios.toFormData({
            name: name || "Milestone"
        })).then(r => {
            props.insertIssue && props.insertIssue(r.data);
        });
    }

    function handleSendShortcut(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            if (e.ctrlKey)
                handleClose(e, true);
            else if (e.target === titleRef.current)
                e.preventDefault();
        }
    }

    return <Modal
        isOpen={props.isOpen}
        overlayClassName={style.issueEditModalOverlay}
        className={style.issueEditModal}
        preventScroll={true}
        onRequestClose={handleClose}
    >
        <div style={{display: 'inline-flex', width: '100%', height: '100%', minHeight: '400px'}}>
            <div className={style.content}>
                <div className={style.inputs}>
                    <textarea rows={1} className={style.title} value={name}
                              onKeyDown={handleSendShortcut} disabled={props.action === 'view'}
                              onInput={e => setName((e.target as HTMLInputElement).value)}
                              placeholder="Enter a title for the milestone" autoFocus />
                </div>
                <button className={style.finish} onClick={e => handleClose(e, true)}>Create Milestone</button>
            </div>
        </div>

        {/* <hr /> */}
    </Modal>
}