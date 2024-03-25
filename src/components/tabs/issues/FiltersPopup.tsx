import Checkbox from '@/components/Checkbox';
import style from './FiltersPopup.module.scss';
import { Label } from '@/types/Label';
import { useContext, useRef, useState } from 'react';
import { useFocus } from '@/hooks/useFocus';
import { AppContext } from '@/contexts/ProjectsContext';
import { Arrays } from '@/utils/Arrays';

interface FiltersPopup {
    close?(): void,
    labels?: string[],
    assignees?: string[],
    onFiltersUpdate?(labels: string[], assignees: string[]): void
}

export default function FiltersPopup(props: FiltersPopup) {
    const [ labels, setLabels ] = useState<string[]>(props.labels || []);
    const [ assignees, setAssignees ] = useState(props.assignees || []);

    const appContext = useContext(AppContext);

    const ref = useRef<HTMLDivElement>(null);
    useFocus(ref, {
        autoFocus: true,
        blur: props.close
    });

    function handleApply() {
        props.onFiltersUpdate && props.onFiltersUpdate(labels, assignees);
        props.close && props.close();
    }

    function handleReset() {
        props.onFiltersUpdate && props.onFiltersUpdate([], []);
        props.close && props.close();
    }

    return <div className={style.popup} ref={ref}>
        <div className={style.header}>
            <h3>Filters</h3>
            <button className={style.close} onClick={props.close}></button>
        </div>

        <div className={style.group}>
            <h3>Labels</h3>
            <div className={style.options}>
                {appContext.labels.map(label => <button key={label.id}>
                    <Checkbox checked={labels.includes(label.id)} setChecked={value => setLabels(Arrays.setValuePresent(labels, label.id, value))} />
                    {label.title === "API" ? "API" : `${label.title.substring(0, 1)}${label.title.substring(1).toLowerCase()}`}
                </button>)}
            </div>
        </div>

        <div className={style.group}>
            <h3>Assignees</h3>
            <div className={style.options}>
                <button><Checkbox />Alan</button>
                <button><Checkbox />adept29</button>
            </div>
        </div>

        <div className={style.group}>
            <h3>Date Range</h3>
            <div className={style.dateRange}>
                <button className={style.dateField}>Start Date</button>
                <a>{'to'}</a>
                <button className={style.dateField}>End Date</button>
            </div>
        </div>

        <div className={style.actionButtons}>
            <button className={style.apply} onClick={handleApply}>Apply Filters</button>
            <button className={style.reset} onClick={handleReset}>Reset</button>
        </div>
    </div>
}