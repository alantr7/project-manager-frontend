import React, { useContext, useEffect, useState } from "react";
import style from './GlobalSearch.module.scss';
import ReactModal from "react-modal";
import { useShortcut } from "@/hooks/useShortcut";
import { NextRouter, useRouter } from "next/router";
import { AppContext } from "@/contexts/ProjectsContext";
import { ProjectContext } from "@/layouts/ProjectLayout";
import { SearchContext } from "@/contexts/SearchContext";

interface SearchResult {
    icon: string;
    name: string;
    callback(router: NextRouter): void;
}

export default function GlobalSearch({navigate}: {navigate: (url: string) => void}) {
    const [ results, setResults ] = useState<SearchResult[]>([]);
    const [ selected, setSelected ] = useState<number>(0);
    const [ repository, setRepository ] = useState<SearchResult[]>([]);
    const { isPageLoaded, groups } = useContext(AppContext);
    const [ isClosing, setClosing ] = useState(false);
    
    const router = useRouter();
    const context = useContext(SearchContext);
    const { query, setQuery } = context;

    useEffect(() => {
        setRepository(groups.map(g => g.projects).flat().map(project => {
            return {
                icon: project.group.icon,
                name: project.name,
                callback: (router: NextRouter) => {
                    const tab = router.query.tab || (router.asPath === '/board' ? 'issues' : 'releases');
                    navigate(`/project/${project.id}/${tab}`);

                    // router.push(`/project/${project.id}/${router.query.tab || 'releases'}`)
                }
            }
        }) as SearchResult[]);
    }, [ groups ]);

    useEffect(() => {
        // Try to keep selection on the current item, if still present after search
        const currentSelected = selected < results.length && selected > -1 ? results[selected] : null;

        const newResults = [...repository].filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
        let newSelected = 0;

        if (currentSelected !== null)
            newSelected = newResults.findIndex(item => item.name === currentSelected.name);

        setResults(newResults);
        setSelected(Math.max(0, newSelected));  
    }, [ query, repository ]);

    useShortcut('/').handle(() => context.openModal());

    function handleNavigate(key: string) {
        let action;
        switch (key) {
            case 'ArrowDown': action = 1; break;
            case 'ArrowUp': action = -1; break;
            case 'Enter': action = 2; break;
            default: return;
        }
        
        if (action !== 2) {
            let newIndex = selected + action;
            setSelected(newIndex < 0 ? results.length - 1 : newIndex < results.length ? newIndex : 0);

            return;
        }

        if (selected !== -1 && isPageLoaded) {
            follow(router, selected);
        }
    }

    function handleClose() {
        setClosing(true);
        setTimeout(() => {
            context.closeModal();
            context.setQuery('');
            setSelected(-1);

            setClosing(false);
        }, 500);
    }

    function follow(router: NextRouter, index: number) {
        setSelected(index);
        handleClose();
        results[index].callback(router);
    }

    function SearchResult(value: string) {
        if (query.length === 0)
            return value;

        const index = value.toLowerCase().indexOf(query);
        return <>
            <span>{value.substring(0, index)}</span>
            <span style={{fontWeight: '500', color: '#0038A6'}}>{value.substring(index, index + query.length)}</span>
            <span>{value.substring(index + query.length)}</span>
        </>
    }

    return <ReactModal className={style.searchModal + ' ' + (isClosing ? style.closing : '')} overlayClassName={style.searchModalOverlay + ' ' + (isClosing ? style.closing : '')} isOpen={context.isOpen} onRequestClose={handleClose}>
        <div onKeyDown={e => handleNavigate(e.key)}>
            <input autoFocus={true} onInput={e => setQuery((e.target as HTMLInputElement).value)} value={query} placeholder="Search for a project, issue..." />
            <div className={style.results}>
                <hr />
                {results.slice(0, 20).map((res, ind) =>
                    <div key={`sr-${res.name}`} className={style.match + ' ' + (ind === selected ? style.selected : '')} onClick={() => follow(router, ind)}>
                        {
                            SearchResult(res.name)
                        }
                    </div>
                )}
            </div>
        </div>
    </ReactModal>
}