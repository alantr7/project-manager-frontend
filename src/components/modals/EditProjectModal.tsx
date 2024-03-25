import { Project } from "@/types/Project";
import { Modal } from "./Modal";
import style from './EditProjectModal.module.scss';
import { useState } from "react";

interface EditProjectModalProps {
    project: Project,
    open: boolean,
    close?(): void
}

export function EditProjectModal(props: EditProjectModalProps) {
    const [settings, setSettings] = useState<'general' | 'members'>('general');

    return <Modal isOpen={props.open} className={style.modal} onRequestClose={props.close}>
        <p className={style.modalTitle}>Editing a project</p>

        <div className={style.header}>
            <div className={style.projectIcon} style={{ backgroundImage: `url(${props.project.icon})` }}></div>
            <div>
                <p className={style.label}>NAME</p>
                <p className={style.projectName}>{props.project.name}</p>

                <p className={style.label}>SHORT DESCRIPTION</p>
                <p>{props.project.description}</p>
            </div>
        </div>

        <div className={style.contentLayout}>
            <div className={style.sidebar}>
                <SettingsButton current={settings} setSettings={setSettings} value="general">General</SettingsButton>
                <SettingsButton current={settings} setSettings={setSettings} value="members">Members</SettingsButton>
            </div>

            <div className={style.content}>
                {settings === 'general' && <GeneralSettings {...props.project} />}
                {settings === 'members' && <MembersSettings />}
            </div>
        </div>

        <button className={style.finish}>Done</button>
    </Modal>
}

function SettingsButton(props: { current: any, value: string, setSettings: (value: any) => void, children: any }) {
    function handleClick() {
        if (props.current === props.value)
            return;

        props.setSettings(props.value);
    }

    return <p className={props.current === props.value ? style.current : ''} onClick={handleClick}>{props.children}</p>
}

function GeneralSettings(props: Project) {
    return <>
        <div className={style.row}>
            <div className={style.item}>
                <p className={style.label}>VERSION</p>
                <p className={style.value}>v{props.version}</p>
            </div>
            <div className={style.item}>
                <p className={style.label}>GROUP</p>
                <p className={style.value}>{props.group.name}</p>
            </div>
            <div className={style.item}>
                <p className={style.label}>GROUP</p>
                <p className={style.value}>rpg</p>
            </div>
        </div>
    </>
}

function MembersSettings() {
    return <div className={style.members}>
        <MemberSettingsMember />
        <MemberSettingsMember />
        <MemberSettingsMember />
        <MemberSettingsMember />
        <MemberSettingsMember />
        <MemberSettingsMember />
    </div>
}

function MemberSettingsMember() {
    return <p className={style.member}>
        alant7
    </p>
}