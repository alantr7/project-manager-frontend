import {useFetch} from "@/hooks/useFetch";
import {LogEntry, LogEntryAction} from "@/types/LogEntry";
import {ChangeEvent, useEffect, useRef, useState} from "react"
import {api} from "../../_app";
import {formatLogEntryMessage} from "@/utils/formatLogEntry";
import style from './activity.module.scss';
import {formatDate} from "@/utils/formatDate";
import {InlineLoader} from "@/components/loader/InlineLoader";
import {createURL} from "@/utils/createURL";
import FilterDropdown from "@/components/FilterDropdown";
import {Calendar} from "@/components/Calendar";
import Navbar from "@/components/navbar/Navbar";
import iconIssue from '../../../../public/icon-issues.png';
import iconBuild from '../../../../public/icon-builds.png';
import FilterSearchPopup from "@/components/FilterSearchPopup";

interface LogGroup {
    label: string,
    logs: LogEntry[]
}

export default function Activity() {
    const [actionFilter, setActionFilter] = useState<string>();
    const [beforeDateFilter, setBeforeDateFilter] = useState<string>();
    const [afterDateFilter, setAfterDateFilter] = useState<string>();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [groups, setGroups] = useState<LogGroup[]>([]);

    const [isPickingDate, setIsPickingDate] = useState<string | undefined>();
    const [isSelectingAuthors, setIsSelectingAuthors] = useState(false);

    const logFetch = useFetch(api, axios => axios.get(createURL(`/v1/logs`, {
        after: afterDateFilter && new Date(afterDateFilter).getTime(),
        before: beforeDateFilter && new Date(beforeDateFilter).getTime(),
        action: actionFilter != "ALL" ? actionFilter : undefined
    })).then(r => {
        setLogs(r.data.map((entry: any) => {
            entry.contextual_data = entry.contextual_data !== null ? JSON.parse(entry.contextual_data as string) : {};
            return entry;
        }));
    }), {autoFetch: true});

    // Updates groups
    useEffect(() => {
        setGroups(groupLogEntriesByTime(logs));
    }, [logs]);

    useEffect(() => {
        logFetch.fetch();
    }, [ actionFilter, beforeDateFilter, afterDateFilter ]);

    function handleDatePick(date: Date) {
        if (isPickingDate === undefined)
            return;

        if (isPickingDate === 'date_from') {
            setAfterDateFilter(date.toLocaleDateString());
        }
        if (isPickingDate === 'date_to') {
            setBeforeDateFilter(date.toLocaleDateString());
        }
        setIsPickingDate(undefined);
    }

    function handleActionChange(e: string) {
        setActionFilter(e);
    }

    function handleApplyFilter() {
        logFetch.fetch();
    }

    return <div className={style.activity}>
        <Navbar><h3>Activity Logs</h3></Navbar>
        <div className={style.content}>
            <div className={style.filtersBar}>
                <div className={style.filters}>
                    <FilterDropdown options={["ALL", "CREATE_BUILD", "OPEN_ISSUE", "CLOSE_ISSUE"]}
                                    onSelect={handleActionChange} text="Action" marginRight={6}></FilterDropdown>
                    <button onClick={() => setIsSelectingAuthors(true)}>Author</button>
                    <FilterDropdown onDropdownRequest={() => setIsPickingDate("date_from")}
                                    text={afterDateFilter ? `From: ${afterDateFilter}` : "Date From"}
                                    defaultValue={afterDateFilter} marginRight={6}></FilterDropdown>
                    <FilterDropdown onDropdownRequest={() => setIsPickingDate("date_to")}
                                    text={beforeDateFilter ? `To: ${beforeDateFilter}` : "Date To"}
                                    defaultValue={beforeDateFilter} marginRight={6}></FilterDropdown>
                </div>
                <input />
            </div>
            <section className={style.logs}>
                {logFetch.isFetching && <InlineLoader style={{marginLeft: '28px'}}>Loading logs...</InlineLoader>}
                <div>
                    {groups.map(group => {
                        return <div key={group.label} className={style.group}>
                            <h3>{group.label}</h3>
                            {group.logs.map(entry => <ActivityEntry key={entry.id} entry={entry}/>)}
                        </div>
                    })}
                </div>
            </section>
            {isPickingDate && <Calendar onBlur={() => setIsPickingDate(undefined)} onDatePick={handleDatePick}/>}
            {isSelectingAuthors && <FilterSearchPopup />}
        </div>
    </div>
}

function ActivityEntry({entry}: { entry: LogEntry }) {
    const [isExpanded, setExpanded] = useState(false);

    return <article key={entry.id} className={style.entry}>
        <img src={getIcon(entry).src}/>
        <div>
            <p><span className={style.project}>{entry.contextual_data.project_name}</span>
                <small>{formatDate(new Date(entry.timestamp))}</small></p>
            <p onClick={() => setExpanded(!isExpanded)}><LogActivitySummary entry={entry}/></p>
            {isExpanded && <ContextualDataTable data={entry.contextual_data}/>}
        </div>
    </article>;
}

function getIcon(entry: LogEntry) {
    switch (entry.action) {
        case "OPEN_ISSUE":
        case "CLOSE_ISSUE":
            return iconIssue;

        default:
            return iconBuild;
    }
}

function LogActivitySummary({entry}: { entry: LogEntry }) {
    switch (entry.action) {
        case "OPEN_ISSUE":
            return <span>{entry.user.name} created an issue <a>{entry.contextual_data.title}</a></span>
        case "CLOSE_ISSUE":
            return <span>{entry.user.name} closed an issue <a>{entry.contextual_data.title}</a></span>
        case "CREATE_BUILD":
            return <span>{entry.user.name} created build <a>{entry.contextual_data.version}</a></span>
        default:
            return <span></span>;
    }
}

function ContextualDataTable({data}: { data: { [key: string]: any } }) {
    return <table>
        {Object.keys(data).map((key: string) => {
            return <tr key={key}>
                <td>{key}</td>
                <td>{data[key]}</td>
            </tr>
        })}
    </table>
}

function groupLogEntriesByTime(logEntries: LogEntry[]): LogGroup[] {
    const now = new Date();
    const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const groupedLogs: LogGroup[] = [];

    // Group log entries by time
    logEntries.forEach(log => {
        const logDate = new Date(log.timestamp);
        const monthKey = logDate.toLocaleDateString(undefined, {month: 'long', year: 'numeric'});

        if (logDate >= thisWeekStart) {
            addToGroup(groupedLogs, 'This Week', log);
        } else if (logDate >= thisMonthStart) {
            addToGroup(groupedLogs, 'This Month', log);
        } else {
            addToGroup(groupedLogs, monthKey, log);
        }
    });

    return groupedLogs;
}

function addToGroup(groups: LogGroup[], label: string, log: LogEntry) {
    const existingGroup = groups.find(group => group.label === label);
    if (existingGroup) {
        existingGroup.logs.push(log);
    } else {
        groups.push({label, logs: [log]});
    }
}