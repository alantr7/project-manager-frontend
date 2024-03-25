import React, {useContext, useEffect, useRef, useState} from 'react';
import style from '../../pages/w/[workspace]/board.module.scss';
import update from 'immutability-helper';
import { BoardList } from '@/types/BoardList';
import axios from 'axios';
import { api } from '../../pages/_app';
import { BoardCard } from '@/types/BoardCard';
import { useDrag, useDrop } from 'react-dnd';
import { rearrangeList } from '@/utils/rearrangeList';
import { useSave } from '@/hooks/useSave';
import { DraggedCard, DraggedList } from '@/pages/w/[workspace]/board';
import { Card } from './BoardCard';
import { useFocus } from '@/hooks/useFocus';
import {AppContext} from "@/contexts/ProjectsContext";

export function List({ data, index, moveList, deleteList, draggedCard, setDraggedCard, placeholder = false }: { index: number, data: BoardList, moveList: (num1: number, num2: number) => void, deleteList: (id: number) => void, draggedCard?: DraggedCard, setDraggedCard: (id?: DraggedCard) => void, placeholder?: boolean }) {
    const [previousName, setPreviousName] = useState(data.name);
    const [name, setName] = useState(data.name);
    const [cards, setCards] = useState<BoardCard[]>(data.cards.filter(card => card !== undefined));
    const [isRenaming, setRenaming] = useState(false);
    const [optionsExpanded, setOptionsExpanded] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { workspace } = useContext(AppContext);

    useEffect(() => {
        setCards(data.cards);
    }, [ data.cards ]);

    const { save } = useSave('lists');

    const moveCard = (dragIndex: number, hoverIndex: number) => {
        setCards((prevCards) =>
            update(prevCards, {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, prevCards[dragIndex]],
                ]
            }),
        )
    };

    const deleteCard = (id: number) => {
        setCards(prevCards => prevCards.filter(card => card.id !== id));
    }

    function handleRename() {
        setRenaming(false);

        if (name !== previousName) {
            setPreviousName(name);
            save(() => api.put(`/v1/board/lists/${data.id}`, axios.toFormData({ name })));
        }
    }

    useEffect(() => {
        if (!draggedCard) return;

        if (draggedCard.list !== data.id) {
            deleteCard(draggedCard.id);
        }
    }, [draggedCard?.list]);

    const [{ isDragging }, drag] = useDrag(() => {
        return {
            type: 'list',
            canDrag(monitor) {
                const clientOffset = monitor.getClientOffset() || { x: 0, y: 0 };
                // return ((clientOffset.x) - (ref.current?.parentElement?.offsetLeft || 0)) < 100 &&
                return data.id !== 0 && ((clientOffset.y) - (ref.current?.parentElement?.offsetTop || 0) - 8) < 33;
            },
            item() {
                return {
                    id: data.id, index
                }
            },
            collect(monitor) {
                return { isDragging: monitor.isDragging() }
            }
        }
    }, [index]);

    const [{ handlerId }, drop] = useDrop<DraggedList, any, any>(() => {
        return {
            accept: 'list',
            collect(monitor) {
                return {
                    handlerId: monitor.getHandlerId()
                }
            },
            hover(item, monitor) {
                rearrangeList({
                    index, item, monitor, move: moveList, ref, selfIdentifier() {
                        return item.index === index || data.id === 0;
                    }, direction: 'horizontal'
                });
            },
            canDrop(item, monitor) {
                return data.id !== 0;
            },
            drop(item, monitor) {
                // if (!monitor.didDrop()) return;
                save(() => api.put(`/v1/board/lists/${item.id}`, axios.toFormData({ position: index })))
            },
        }
    }, [cards, index]);

    const [{ handlerIdCard }, dropCard] = useDrop<DraggedCard, any, any>(() => {
        return {
            accept: 'card',
            hover(item, monitor) {
                if (item.list === data.id)
                    return;

                if (cards.find(card => card?.id === item.id))
                    return;

                setCards([...cards, {
                    id: item.id,
                    issue: item.issue,
                    project: item.project
                }]);
                item.index = cards.length;

                setDraggedCard({
                    ...item,
                    list: data.id
                });

                item.list = data.id;
                item.setList(data.id);
            },
            drop(item, monitor) {
                const nextIndex = draggedCard?.index;
                setDraggedCard(undefined);

                if (!monitor.didDrop())
                    return;
                    
                const card = draggedCard as DraggedCard;
                if (card.originList == data.id)
                    return;
    
                save(() => api.put(`/v1/workspaces/${workspace.weak_id}/board/cards/${card.id}`, axios.toFormData({
                    list: card.list,
                    position: nextIndex
                })));
            }
        }
    }, [cards]);

    drag(drop(dropCard(ref)));

    return <>
        <div className={style.list + ' ' + (isDragging ? style.dragged : '') + ' ' + (placeholder ? style.placeholder : '')} ref={ref} data-handler-id={handlerId} list-id={data.id}>
            {!isRenaming && <p className={style.title} onClick={() => setRenaming(data.id !== 0)}>{name}</p>}
            {isRenaming && <input className={style.title} value={name} onBlur={handleRename} onInput={ev => setName((ev.target as HTMLInputElement).value)} onKeyDown={e => {if (e.key === 'Enter') handleRename()}} autoFocus={true} />}
            {data.id !== 0 && <button className={style.more} onClick={() => setOptionsExpanded(!optionsExpanded)} />}
            <div className={style.cards}>
                {cards.filter(card => card != null).map((card, index) => <Card key={card.id} cards={cards} draggedCard={draggedCard} setDraggedCard={setDraggedCard} data={card} list={data} index={index} moveCard={moveCard} deleteCard={deleteCard} />)}
            </div>

        </div>
        {optionsExpanded && <ListOptions closeOptions={() => setOptionsExpanded(false)} data={data} x={(ref.current?.offsetLeft || 0) + (ref.current?.clientWidth || 0) - 32} y={(ref.current?.offsetTop || 0) + 37} renameList={() => setRenaming(true)} deleteList={deleteList} />}
    </>;
}

function ListOptions({ data, x, y, renameList, deleteList, closeOptions }: { data: BoardList, x: number, y: number, renameList: () => void, deleteList: (id: number) => void, closeOptions: () => void}) {
    const ref = useRef<HTMLDivElement>(null);
    const blur = useFocus(ref, {
        autoFocus: true,
        blur() {
            closeOptions();
        },
        filter(element, helper) {
            return !element.classList.contains(style.more) || !helper.hasParent(parent => parseInt(parent.getAttribute('list-id') || "0") === data.id);
        },
    });

    return <div ref={ref} className={style.options} style={{ left: `${x}px`, top: `${y}px` }} tabIndex={-1} autoFocus={true}>
        <a onClick={() => { renameList(); closeOptions(); }}>Rename List</a>
        <hr />
        <a onClick={() => deleteList(data.id)}>Delete List</a>
    </div>
}