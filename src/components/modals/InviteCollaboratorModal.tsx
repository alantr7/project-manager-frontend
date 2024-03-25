import { Modal } from "./Modal";
import style from './InviteCollaboratorModal.module.scss';
import TextInput from "../TextInput";
import {useContext, useRef, useState} from "react";
import {api} from "@/pages/_app";
import {AppContext} from "@/contexts/ProjectsContext";
import axios from "axios";

interface InviteCollaboratorModalProps {
    close?(): void
}

export function InviteCollaboratorModal(props: InviteCollaboratorModalProps) {
    const [ email, setEmail ] = useState("");
    const { workspace } = useContext(AppContext);

    function handleSubmit() {
        api.post(`/v1/workspaces/${workspace.weak_id}/invitations`, axios.toFormData({
            user: email
        })).then(r => {
            alert("Success!");
        }).catch(err => {
            alert(err);
        })
    }

    return <Modal isOpen={true} className={style.modal} onRequestClose={props.close}>
        <h2>Invite a collaborator...</h2>
        <TextInput valueProvider={email} valueSetter={setEmail} placeholder="Enter the email address here" autoFocus={true} />

        <div className={style.permissionsContainer}>
            <p>Upon joining the workspace, collaborator will be able to:</p>
            <ul>
                <li>Create new projects</li>
                <li>Edit existing projects</li>
                <li>Create and manage builds</li>
                <li>Create and edit issues</li>
            </ul>

            <p>To change these permissions, edit the default role.</p>
        </div>

        <button className={style.submit} onClick={handleSubmit}>Send Invitation</button>
    </Modal>
}