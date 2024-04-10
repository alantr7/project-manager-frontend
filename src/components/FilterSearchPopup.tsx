import style from './FilterSearchPopup.module.scss';
import Checkbox from "@/components/Checkbox";
import {useContext, useState} from "react";
import {useTimeout} from "@/hooks/useTimeout";

interface FilterSearchPopupProps<T> {
    fetch(query: string): Promise<any>;

    getDataFromFetch(data: any): T[];

    getIdFrom(data: T): string;

    getNameFrom(data?: T): string;

    apply(data: T[]): void;
}

export default function FilterSearchPopup<T>(props: FilterSearchPopupProps<any>) {
    const [selected, setSelected] = useState<{ [key: string]: boolean }>({});
    const [ query, setQuery ] = useState("");
    const [ searchResults, setSearchResults ] = useState<T[]>([]);

    const select = (id: string, flag: boolean) => {
        setSelected(prev => {
            if (flag) {
                prev[id] = true;
            } else {
                delete prev[id];
            }

            return {...prev};
        });
    }

    let actualQuery = query;
    const fetchResults = useTimeout(() => {
        props.fetch(actualQuery)
            .then(data => setSearchResults(props.getDataFromFetch(data)));
    }, { timeout: 1500 });

    const updateQuery = (e: any) => {
        const q = e.target.value;
        setQuery(q);

        if (q.length < 3) {
            setSearchResults([]);
            return;
        }

        fetchResults.stop();

        actualQuery = q;
        fetchResults.start()
    }

    return <div className={style.popup}>
        <input type="text" value={query} placeholder={"Search..."} onInput={updateQuery}/>
        {searchResults.length !== 0 && <hr/>}
        <div>
            <div className={`${style.container}`}>
                {searchResults
                    .slice(0, Math.min(searchResults.length, 24))
                    .filter(project => !selected[props.getIdFrom(project)])
                    .map(project => <div className={style.item} onClick={() => select(props.getIdFrom(project), true)}>
                        <Checkbox/>{props.getNameFrom(project)}
                    </div>)}
            </div>
            <hr/>
            <div className={style.container}>
                {Object.entries(selected).map(([k, v]) => <div className={style.item} onClick={() => select(k, false)}>
                    <Checkbox checked={true}/>{props.getNameFrom(searchResults.find(p => props.getIdFrom(p) === k))}
                </div>)}
            </div>
            <div className={style.actionButtons}>
                <button className={style.apply} onClick={() => props.apply(Object.keys(selected))}>Apply</button>
                <button className={style.reset}>Cancel</button>
            </div>
        </div>
    </div>
}