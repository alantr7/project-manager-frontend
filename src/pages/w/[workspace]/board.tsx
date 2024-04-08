import {DragEvent, SetStateAction, SyntheticEvent, useCallback, useContext, useEffect, useRef, useState} from 'react';
import style from './board.module.scss';
import update from 'immutability-helper';
import { BoardList } from '@/types/BoardList';
import { useFetch } from '@/hooks/useFetch';
import axios from 'axios';
import { api } from '../../_app';
import { BoardCard } from '@/types/BoardCard';
import IssueEditModal from '@/components/tabs/issues/EditIssueModal';
import { Issue } from '@/types/Issue';
import { FormEvent } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import assert from 'assert';
import { rearrangeList } from '@/utils/rearrangeList';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { PlaceholderList } from '@/components/board/PlaceholderList';
import { repeatUsing } from '@/utils/repeatable';
import Head from 'next/head';
import { useSave } from '@/hooks/useSave';
import { List } from '@/components/board/BoardList';
import { useFocus } from '@/hooks/useFocus';
import Navbar from '@/components/navbar/Navbar';
import {AppContext} from "@/contexts/ProjectsContext";

export interface DraggedCard extends BoardCard {
    id: number,
    list: number,
    index: number,
    lastReplaced: number,
    originIndex: number,
    originList: number,
    setList(id: number): void
}

export interface DraggedList {
    id: number,
    index: number
}

function NewList({ cancel, createList }: { cancel: () => void, createList: (name: string) => void }) {
    const [title, setTitle] = useState('');
    const [isSubmitting, setSubmitting] = useState(false);

    const ref = useRef<HTMLInputElement>(null);
    useFocus(ref, {
        autoFocus: true,
        blur(ev) {
            if (title.length === 0)
                cancel();
        },
    });

    function handleEnter(key: string) {
        if (key === 'Enter') {
            setSubmitting(true);
            createList(title);
        } else if (key === 'Escape')
            cancel();
    }

    return <div className={style.list}>
        <input ref={ref} className={style.title} disabled={isSubmitting} value={title} onKeyDown={e => handleEnter(e.key)} onInput={e => setTitle((e.target as HTMLInputElement).value)} placeholder='Name for a list' />
    </div>
}

export default function Board() {
    const [lists, setLists] = useState<BoardList[]>([]);
    const [isCreatingList, setCreatingList] = useState(false);
    const [draggedCard, setDraggedCard] = useState<DraggedCard>();
    const workspace = useContext(AppContext).workspace;

    const data = useFetch(api, axios => axios.get(`/v1/workspaces/${workspace.weak_id}/board`));
    const { save: save } = useSave('board');

    useEffect(() => {
        if (workspace.weak_id.length === 0)
            return;

        api.get(`/v1/workspaces/${workspace.weak_id}/board`).then(r => r.data).then(setLists);
    }, [ workspace ]);

    useEffect(() => {
        if (workspace.weak_id.length === 0)
            return;

        data.fetch();
    }, [])

    const moveList = useCallback((dragIndex: number, hoverIndex: number) => {
        setLists((prevCards) =>
            update(prevCards, {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, prevCards[dragIndex]],
                ]
            }),
        )
    }, []);

    const deleteList = (id: number) => {
        setLists(lists => {
            const list = lists.find(list => list.id === id);
            const copy = lists.filter(list => list.id !== id)
            copy[0] = {
                ...copy[0],
                cards: [
                    ...copy[0].cards,
                    ...(list as BoardList).cards
                ]
            }

            return copy;
        });
        save(() => api.delete(`/v1/board/lists/${id}`));
    }

    function createList(title: string) {
        api.post<BoardList>(`/v1/board/lists`, axios.toFormData({ name: title }))
            .then(r => {
                setLists([...lists, r.data]);
            })
            .finally(() => {
                setCreatingList(false);
            });
    }

    return <>
        <Navbar key="navbar">
            <h3>Issue Board</h3>
        </Navbar>
        <Head>
            <title>Issue Board</title>
        </Head>
        <div key="board" className={style.board}>
            {data.isFetched && <>
                {lists.map((list, index) => <List key={`${workspace.weak_id}-${list.id}`} draggedCard={draggedCard} setDraggedCard={setDraggedCard} moveList={moveList} deleteList={deleteList} index={index} data={list} />)}
                {!isCreatingList && <div className={`${style.list} ${style.createList}`}>
                    <button onClick={() => setCreatingList(true)}>Create List</button>
                </div>}
                {isCreatingList && <NewList createList={createList} cancel={() => setCreatingList(false)} />}
            </>}
            {!data.isFetched && repeatUsing([] as any[], arr => arr.push(<PlaceholderList />), 4)}
        </div>
    </>
}