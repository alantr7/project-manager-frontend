import { useShortcut } from "@/hooks/useShortcut";
import { ProjectContext } from "@/layouts/ProjectLayout";
import { Issue } from "@/types/Issue";
import axios from "axios";
import style from './IssuesTab.module.scss'
import { FocusEvent, KeyboardEvent, SyntheticEvent, useContext, useState } from "react";
import { api } from "@/pages/_app";

export default function NewIssue({issues, setIssues}: {issues: Issue[], setIssues: (issues: Issue[]) => void}) {

    const [isSubmitting, setSubmitting] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [attachments, setAttachments] = useState([] as {url: string}[]);
    const [labels, setLabels] = useState([] as string[]);

    const availableLabels = [ 'bug', 'feature' ];

    const [isFocused, setFocused] = useState(false);

    const { project: { id: projectId } } = useContext(ProjectContext);
    console.log(issues);

    useShortcut('N').handle(e => {
        setFocused(true);
        document.getElementById('create-issue')?.focus();
    });
    useShortcut('Escape', true).handle(() => setFocused(false));

    function updateFocus(e: FocusEvent<HTMLDivElement, Element>) {
        const target = e.target as HTMLElement;
        const related = e.relatedTarget as HTMLElement;

        let result = true;

        if (related === null) {
            result = false;
        }
/*
        if (!result && (title.length === 0 && description.length === 0)) {
            setFocused(false);
        }*/
    }

    function createIssue() {
        setSubmitting(true);
        const fd = new FormData();
        fd.append('title', title);
        fd.append('description', description);

        api.post(`/v1/projects/${projectId}/issues`, fd).then(r => {
            setTitle('');
            setDescription('');
            setAttachments([]);
            // setFocused(false);
            setIssues([r.data, ...issues]);

            setSubmitting(false);
        });
    }

    function keyDown(e: KeyboardEvent) {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            createIssue();
        }
    }

    function handlePaste(e: SyntheticEvent) {
        const event = e.nativeEvent as ClipboardEvent;
        const clipboard = event.clipboardData;

        const items = clipboard?.items || [];

        for (let i = 0; i < items.length; i++) {
            const { kind, type } = items[i];
            if (kind !== 'file')
                continue;

            const file = items[i].getAsFile();
            const reader = new FileReader();
            reader.onload = e => {
                const result = e.target?.result;
                setAttachments([...attachments, { url: result as string }]);
            }

            reader.readAsDataURL(file as Blob);
        }
        console.log(clipboard?.items[0]);
    }

    return <div className={style.createIssue + (isFocused ? ' ' + style.selected : '')} onBlur={e => updateFocus(e)}>
        {isSubmitting && <div className={style.submitting}></div>}
        <input id="create-issue" autoComplete='off' placeholder={isFocused ? 'Enter a title for the new issue' : 'Create a new issue...'} onKeyDown={e => keyDown(e)} onFocus={() => setFocused(true)} value={title} onInput={e => setTitle((e.target as HTMLInputElement).value)} />
        <input disabled hidden />
        <hr></hr>
        <textarea placeholder='Issue description' onKeyDown={e => keyDown(e)} value={description} onPaste={handlePaste} onInput={e => setDescription((e.target as HTMLInputElement).value)}></textarea>
        <hr />
        <div className={style.files}>
            {attachments.map((obj) => {
                return <img src={obj.url} key={obj.url} width={64} height={64} style={{marginLeft: 16, border: '1px solid black'}} />
            })}
        </div>
        {/* <hr /> */}
        <div className={style.attachments}>
            <div className={style.labels}>
                <button>Labels</button>
            </div>
            <button className={style.action}></button>
            {/* <button className={style.action}></button> */}
            {/* <button className={style.action}></button> */}
            {/* <button className={style.action}></button> */}

            <button className={style.submit} disabled={title.trim().length === 0} onClick={() => createIssue()} title='Create an issue (CTRL+ENTER)'>Create</button>
        </div>
    </div>

}