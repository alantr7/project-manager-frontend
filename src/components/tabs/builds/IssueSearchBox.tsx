import TextInput from "@/components/TextInput";
import {Modal} from "@/components/modals/Modal";
import {useContext, useEffect, useState} from "react";
import style from './IssueSearchBox.module.scss';
import {Issue} from "@/types/Issue";
import {api} from "@/pages/_app";
import {ProjectContext} from "@/layouts/ProjectLayout";
import {useFetch} from "@/hooks/useFetch";
import {formatDate} from "@/utils/formatDate";
import {InlineLoader} from "@/components/loader/InlineLoader";

interface IssueSearchBoxProps {
    issues?: Issue[],

    onCompleted?(issues: Issue[]): void,

    select?(issue: Issue): void,

    close?(): void,
}

export function IssueSearchBox(props: IssueSearchBoxProps) {
    const project = useContext(ProjectContext);
    const [query, setQuery] = useState("");
    const [issues, setIssues] = useState<Issue[]>([]);
    const [results, setResults] = useState<(Issue & { isSelected: boolean })[]>([]);
    const [isClosing, setClosing] = useState(false);

    const fetch = useFetch(api, api => api.get<Issue[]>(`/v1/projects/${project.project.id}/issues?closed=true&logged=false`));
    useEffect(() => {
        fetch.fetch().then(r => {
            setIssues(r.data);
            setResults(r.data.map(it => ({...it, isSelected: false})));
        });
    }, []);

    useEffect(() => {
        setResults(issues.filter(issue => {
            return issue.title.includes(query) || issue.description.includes(query);
        }).map(iss => ({...iss, isSelected: false})));
    }, [query]);

    function handleComplete() {
        props.onCompleted && props.onCompleted(results.filter(issue => issue.isSelected));
        setClosing(true);
    }

    return <Modal isOpen={true} isClosing={isClosing} overlayClassName={style.overlay} className={style.modal}
                  onRequestClose={props.close}>
        <TextInput valueProvider={query} valueSetter={setQuery} className={style.queryInput}
                   placeholder="Issue title, description, etc."/>
        <hr/>

        <div className={style.results}>
            {results.length === 0 && fetch.isFetching &&
                <InlineLoader style={{marginLeft: '10px'}}>Fetching issues...</InlineLoader>}
            {results.map(issue => <IssueResult key={issue.id} issue={issue} selected={issue.isSelected}
                                               onSelect={() => setResults(results => {
                                                   return results.map(result => {
                                                       if (result.id === issue.id)
                                                           return {
                                                               ...result,
                                                               isSelected: !result.isSelected
                                                           }

                                                       return result;
                                                   })
                                               })}/>)}
        </div>

        <hr/>

        <div className={style.footer}>
            <p className={style.selectedCount}>Selected Issues: {results.filter(result => result.isSelected).length}</p>
            <div className={style.buttons}>
                <button className={style.cancel} onClick={() => setClosing(true)}>Cancel</button>
                <button className={style.done} onClick={handleComplete}>Done</button>
            </div>
        </div>
    </Modal>
}

function IssueResult({issue, selected, onSelect}: { issue: Issue, selected: boolean, onSelect: () => void }) {
    return <div className={`${style.result} ${selected ? style.selected : ''}`} onClick={onSelect}>
        <div className={style.header}>
            <p className={style.labels}>{issue.labels.map(label => <span key={label.id} style={{
                color: label.textColor,
                backgroundColor: label.backgroundColor
            }}>{label.title}</span>)}</p>
            <p className={style.author}>{formatDate(issue.creationDate)}</p>
            <p className={style.index}>#{issue.index}</p>
        </div>
        <p className={style.title}>{issue.title}</p>
        {issue.description.length > 0 && <p className={style.description}>{issue.description}</p>}
    </div>;
}