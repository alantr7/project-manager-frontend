import {SyntheticEvent, useContext, useRef, useState} from 'react';
import style from '../../pages/w/[workspace]/board.module.scss';
import {BoardList} from '@/types/BoardList';
import axios from 'axios';
import {api} from '../../pages/_app';
import {BoardCard} from '@/types/BoardCard';
import IssueEditModal from '@/components/tabs/issues/EditIssueModal';
import {Issue} from '@/types/Issue';
import {useDrag, useDrop} from 'react-dnd';
import {rearrangeList} from '@/utils/rearrangeList';
import {toast} from 'react-toastify';
import Swal from 'sweetalert2';
import {useSave} from '@/hooks/useSave';
import {DraggedCard} from '@/pages/w/[workspace]/board';
import Checkbox from '../Checkbox';
import {AppContext} from "@/contexts/ProjectsContext";
import {useApp} from "@/hooks/useApp";

export function Card({index, draggedCard, setDraggedCard, list, cards, data, moveCard, deleteCard}: {
    cards: any,
    index: number,
    draggedCard?: DraggedCard,
    setDraggedCard: (id?: DraggedCard) => void,
    list: BoardList,
    data: BoardCard,
    moveCard: (num1: number, num2: number) => void,
    deleteCard: (id: number) => void
}) {

    const [isOpen, setOpen] = useState(false);
    const [issue, setIssue] = useState(data.issue);
    const app = useApp();

    const [project, setProject] = useState(app.getProject(data.project));
    const [listId, setListId] = useState(list.id);

    const ref = useRef<HTMLDivElement>(null);
    const {save: save} = useSave('drag-card');

    const [{isDragging, cardList}, drag] = useDrag(() => ({
        type: 'card',
        item() {
            const dragged = {
                index: index,
                list: list.id,

                originIndex: index,
                originList: list.id,
                lastReplaced: -1,

                ...data,

                setList: (num: number) => {
                    setListId(num);
                    if (num !== list.id)
                        deleteCard(data.id);
                }
            };
            setDraggedCard(dragged);
            return dragged;
        },
        collect: (monitor) => {
            return {isDragging: monitor.isDragging() || draggedCard?.id === data.id, cardList: monitor.getItem()?.list}
        }
    }), [list, index, draggedCard]);

    const [{handlerId}, drop] = useDrop<DraggedCard, any, any>({
        accept: 'card',
        collect: (monitor) => ({
            handlerId: monitor.getHandlerId()
        }),
        hover(item, monitor) {
            if (listId === 0)
                return;

            rearrangeList({
                currentId: data.id, index, item, monitor, move: moveCard, ref, selfIdentifier() {
                    return item.index === index || item.list !== list.id;
                }, direction: 'vertical'
            });
        },
        drop(item, monitor) {
            const card = draggedCard as DraggedCard;
            handleMoveCard(card);

            // If moved from another list, then let the BoardList handle the movement
            if (item.originList === card.list && item.originIndex !== card.index) {
                save(() => api.put(`/v1/board/cards/${card.id}`, axios.toFormData({
                    list: card.list,
                    position: draggedCard?.index
                })));
            }

            setDraggedCard(undefined);
        },
    }, [list, index, cards]);

    function handleOpen() {
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
    }

    function handleComplete(e: any) {
        save(api.put(`/v1/projects/${project?.id}/issues/${data.issue.id}/status`, axios.toFormData({
            state: "RESOLVED"
        })).then(() => {
            toast.success(`Issue ${data.issue.id} closed.`);
            deleteCard(data.id);
        }));
    }

    function handleDelete(e: SyntheticEvent) {

        function deleteIssue() {
            deleteCard(data.id);
            save(api.delete(`/v1/projects/${project?.id}/issues/${data.issue.id}`).then(() => toast.success(`Issue ${data.issue.id} deleted.`)));
        }

        if ((e.nativeEvent as MouseEvent).shiftKey) {
            deleteIssue();
            return;
        }

        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteIssue();
            }
        });
    }

    function handleRefresh(issue: Issue) {
        setIssue(issue);
    }

    function handleMoveCard(draggedCard: DraggedCard) {

    }

    drag(drop(ref));

    return <div className={style.card + ' ' + (isDragging ? style.dragAndDrop : '')}
                style={{display: listId === list.id ? 'block' : 'none'}} ref={ref} onClick={handleOpen}
                data-handler-id={handlerId}>
        <div>
            <div className={style.cardHeader}>
                <img src={project?.icon}/>
                <span className={style.project}>{project?.id || data.project}</span>
            </div>
        </div>
        <span>{issue.title}</span>
        <div style={issue.tasks.length > 0 ? {marginTop: '4px', marginLeft: '0px'} : {display: 'none'}}>
            {/*issue.tasks.map(task => <div style = {{display: 'flex'}}>
                <Checkbox checked={(Math.random() > 0.5)} />
                <p style={{margin: '0'}}>{task.text}</p>
</div>)*/}
        </div>

        <div className={style.cardFooter}>
            {issue.tasks.length > 0 && <span
                className={style.tasks}>{issue.tasks.filter(task => task.completed).length}/{issue.tasks.length}</span>}
            {issue.labels.map(label => <span key={label.id} className={style.label} style={{
                color: label.textColor,
                backgroundColor: label.backgroundColor
            }}>{label.title}</span>)}
        </div>

        {/* <hr color={'#eee'} /> */}
        {isOpen && <IssueEditModal action='edit' isOpen={isOpen} issue={issue} refresh={handleRefresh}
                                   onRequestClose={handleClose} handleComplete={handleComplete}
                                   handleDelete={handleDelete}/>}
    </div>

}