import { BaseSyntheticEvent, KeyboardEvent, SetStateAction, SyntheticEvent, useContext, useEffect, useRef, useState } from 'react';
import style from './EditIssueModal2.module.scss';
import { ChecklistItem } from '@/types/ChecklistItem';
import TextInput from '@/components/TextInput';
import { useSave } from '@/hooks/useSave';
import { api } from '@/pages/_app';
import { ProjectContext } from '@/layouts/ProjectLayout';
import { Issue } from '@/types/Issue';
import axios from 'axios';
import { IssueTask } from '@/types/IssueTask';
import { useFocus } from '@/hooks/useFocus';
import { generateId } from '@/utils/generateId';
import TextField from '@/components/TextField';
import Checkbox from '../Checkbox';
import { useTimeout } from '@/hooks/useTimeout';

interface EditIssueModalChecklistProps {
    issue: Issue,
    action: "edit" | "create" | "view",
    preventNew?: boolean,
    preventEdit?: boolean,
    preventToggle?: boolean,
    updateIssue?(issue: Issue): void,
    items: ({ isLoading?: boolean } & IssueTask)[],
    setItems(action: SetStateAction<({ isLoading?: boolean } & IssueTask)[]>): void
}

export default function EditIssueModalChecklist2(props: EditIssueModalChecklistProps) {

    const save = useSave("task_create");

    const addItem = (text: string) => {
        const tempId = generateId();
        const newArray = [];

        props.setItems(items => {
            const array = ([
                ...items,
                { id: tempId, text, isLoading: props.action === "edit", completed: false }
            ])

            if (props.action === "edit") {
                save.save(api.post(`/v1/projects/${props.issue.project?.id}/issues/${props.issue.id}/tasks`, axios.toFormData({
                    text
                })).then(r => {
                    updateItem(tempId, {
                        id: r.data.id,
                        completed: false,
                        text
                    });
                    props.updateIssue && props.updateIssue({
                        ...props.issue,
                        tasks: array
                    });
                }));
            }

            return array;
        });
    }

    const updateItem = (id: string, task: IssueTask) => {
        props.setItems(items => {
            const array = items.map(it => it.id === id ? task : it);
            props.updateIssue && props.updateIssue({
                ...props.issue,
                tasks: array
            })

            return array;
        });
    }

    const deleteItem = (id: string) => {
        props.setItems(items => {
            const array = items.filter(it => it.id !== id);
            props.updateIssue && props.updateIssue({
                ...props.issue,
                tasks: array
            })

            return array;
        });
        api.delete(`/v1/projects/${props.issue.project?.id}/issues/${props.issue.id}/tasks/${id}`);
    }

    return <div className={style.checklist}>
        {props.items.map(item => <IssueChecklistItem key={item.id} task={item} issue={props.issue} updateTask={task => updateItem(item.id, task)} deleteTask={() => deleteItem(item.id)} preventEdit={props.preventEdit} preventToggle={props.preventToggle}>{item.text}</IssueChecklistItem>)}
        {/* <IssueChecklistItem>Make the timer work (for some reason it doesnt)</IssueChecklistItem><br /> */}
        {/* <IssueChecklistItem>Doors do not close when a dungeon is done</IssueChecklistItem><br /> */}
        {/* <IssueChecklistItem>Doors sometimes get stuck open</IssueChecklistItem><br /> */}

        {!props.preventNew && <IssueChecklistNewItem addItem={addItem}></IssueChecklistNewItem>}
    </div>

}

interface IssueChecklistItemProps {
    children?: any,
    task: IssueTask,
    issue: Issue,
    preventEdit?: boolean,
    preventToggle?: boolean,
    updateTask(task: IssueTask): void,
    deleteTask(): void,
}

function IssueChecklistItem(props: IssueChecklistItemProps) {
    const [isChecked, setChecked] = useState(props.task.completed);
    const [text, setText] = useState(props.task.text);
    const [isEditing, setEditing] = useState(false);

    const inputRef = useRef<HTMLTextAreaElement>(null);

    const save = useSave(props.task.id);
    const { isSaving } = save;

    useFocus(inputRef, { autoFocus: true }, [isEditing]);

    function finishEditing() {
        setEditing(false);

        // Check if the text was changed
        if (props.task.text === text && props.task.completed === isChecked)
            return;

        save.save(api.put(`/v1/projects/${props.issue.project?.id}/issues/${props.issue.id}/tasks/${props.task.id}`, axios.toFormData({
            text,
            completed: isChecked
        })))
    }

    function handleSetChecked(flag: boolean) {
        if (isSaving || props.preventToggle) return;
        setChecked(flag);

        save.save(api.put(`/v1/projects/${props.issue.project?.id}/issues/${props.issue.id}/tasks/${props.task.id}`, axios.toFormData({
            completed: flag
        })));

        props.updateTask({
            ...props.task,
            completed: flag
        });
    }

    return <div>
        <div className={style.item} onClick={e => e.stopPropagation()}>
            <div className={style.content}>
                <Checkbox checked={isChecked} setChecked={handleSetChecked} align="top" style={{ margin: '7px 6px 0 0' }} />
                {!isEditing ? <p onDoubleClick={e => { if (!isEditing && !props.preventEdit) { setEditing(true); e.stopPropagation(); } }}>{text}</p> :
                    <TextField
                        ref={inputRef}
                        className={isEditing ? style.edited : ''}
                        onClick={e => { if (isEditing) e.stopPropagation() }}
                        rows={1}
                        autoResize={true}
                        autoFocus={true}
                        valueProvider={text} valueSetter={setText}
                        onBlur={finishEditing} onEnterPress={finishEditing} />}
            </div>

            {!props.preventEdit &&
                <div className={style.taskButtons} onClick={e => e.stopPropagation()}>
                    <button className={style.edit} onClick={() => setEditing(true)}></button>
                    <button className={style.delete} onClick={props.deleteTask}></button>
                </div>
            }
        </div>
    </div>
}

function IssueChecklistNewItem({ addItem }: { addItem: (value: string) => void }) {
    const [value, setValue] = useState("");
    const [isCreating, setCreating] = useState(false);

    const handleEnter = (e: KeyboardEvent, content: string) => {
        addItem(content);
        setValue("");

        e.preventDefault();
    }

    const handleBlur = (e: BaseSyntheticEvent) => {
        // () => setCreating(false)
        console.log(e);

        // @ts-ignore
        const related = e.relatedTarget;
        if (related) {
            setCreating(false);
        }
    }

    const ref = useRef<HTMLTextAreaElement>(null);
    useFocus(ref, { autoFocus: true }, [isCreating]);

    return <div className={`${isCreating ? style.item : ''} ${style.newItem}`}>
        {isCreating && <div style={{ flexGrow: '1' }}>
            <TextField placeholder="Describe your task" ref={ref} autoFocus={true} onBlur={handleBlur} rows={1} valueProvider={value} valueSetter={setValue} onEnterPress={handleEnter} />
            <div className={style.newItemButtons}>
                <button role='cancel'>Cancel</button>
                <button role='save'>Save</button>
            </div>
        </div>}
        {!isCreating && <button className={style.addItem} onClick={() => setCreating(true)}>+ Add Task</button>}
    </div>
}