import { Group } from '@/types/Group';
import Checkbox from '../Checkbox';
import TextField from '../TextField';
import style from './CreateProjectModal.module.scss';
import { Modal } from './Modal';
import {useContext, useState} from 'react';
import TextInput from '../TextInput';
import ReactDropdown, { Option } from 'react-dropdown';
import { Project } from '@/types/Project';
import { api } from '@/pages/_app';
import axios from 'axios';
import {useApp} from "@/hooks/useApp";
import {AppContext} from "@/contexts/ProjectsContext";

interface CreateProjectModalProps {
    group?: Group,
    groups?: Group[],
    close?(): void,
    complete?(project: Project): void
}

export function CreateProjectModal(props: CreateProjectModalProps) {
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [icon, setIcon] = useState<string | undefined>(props.group?.icon);
    const [group, setGroup] = useState(props.group);
    const [version, setVersion] = useState('');
    const [isClosing, setClosing] = useState(false);
    const workspace = useContext(AppContext).workspace;

    function handleGroupChange(opt: Option) {
        const groupId = opt.value;
        const group = props.groups?.find(group => group.id.toString() === groupId) as Group;
        setGroup(group);
        setIcon(group.icon);
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

    function handleCreateProject() {
        if (!version.match(/(([0-9]+.[0-9]+)+|([0-9]+))(a|b|)/)) {
            alert('Version is not valid!');
            return;
        }

        api.post<Project>(`/v1/workspaces/${workspace.name}/projects`, axios.toFormData({ name: name, group: group?.id, version: version.length > 0 ? version : undefined })).then(r => {
            props.complete && props.complete(r.data);
            setClosing(true);
        });
    }

    return <Modal isOpen={true} isClosing={isClosing} onRequestClose={props.close} className={style.modal}>
        <h2>Create a project</h2>

        <div className={style.flex}>
            <div className={style.iconSection}>
                <img className={style.icon} src={icon}></img>
                <p>(Change Icon)</p>
            </div>
            <div className={style.detailsSection}>
                <TextInput valueSetter={setName} valueProvider={name} placeholder="Enter the project name here" autoFocus={true}></TextInput>
                <div>
                    <TextField valueSetter={setDesc} valueProvider={desc} rows={4} maxRows={1} maxLength={128} placeholder='Enter a short project description (Optional)'></TextField>
                    <p className={style.charCounter}>{desc.length} / 128</p>
                </div>
            </div>
        </div>

        <hr />

        <div style={{ display: 'flex' }}>
            <div className={style.group}>
                <p>Project will be created in group:</p>

                <ReactDropdown className={style.dropdown} controlClassName={style.control} menuClassName={style.menu} value={{ value: group?.id.toString() as string, label: group?.name }} options={props.groups?.map(group => ({
                    className: style.option,
                    label: group.name,
                    value: group.id.toString()
                } as Option)) || []} onChange={handleGroupChange}></ReactDropdown>
            </div>
            <div className={style.group}>
                <p>Starting project version:</p>

                <TextInput placeholder='0.1.0' valueProvider={version} valueSetter={handleSetVersion} />
            </div>
        </div>


        <div className={style.projectVisibility}>
            <p><Checkbox align='center' />Make this project private</p>
            <p className={style.visibilityHint}>Only you and people with allowed roles will be able to see this project.</p>
        </div>

        <button className={style.submit} onClick={handleCreateProject}>Create Project</button>
    </Modal>
}