import { Ref, RefCallback, RefObject } from "react"

type Direction = "vertical" | "horizontal";

interface Props {
    currentId?: number,
    selfIdentifier(): boolean,
    direction: Direction,
    ref: RefObject<any>,
    item: any,
    index: number,
    monitor: any,
    move(dragIndex: number, hoverIndex: number): void
}

export function rearrangeList(props: Props) {
    if (!props.ref.current) {
        return
    }
    const dragIndex = props.item.index
    const hoverIndex = props.index

    // Don't replace items with themselves
    if (props.selfIdentifier()) {
        // props.item.lastReplaced = -1;
        return
    }

    // if (props.currentId === props.item.lastReplaced)
        // return;

    // Determine rectangle on screen
    const hoverBoundingRect = props.ref.current?.getBoundingClientRect()
    if (props.direction === "vertical") {
        vertical(props);
    } else {
        horizontal(props);
    }
}

function vertical(props: Props) {
    const hoverBoundingRect = props.ref.current?.getBoundingClientRect()
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

    // Determine mouse position
    const clientOffset = props.monitor.getClientOffset()
    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top

    const dragIndex = props.item.index
    const hoverIndex = props.index

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        if (hoverClientY - 8 < 0) return;
        props.item.index = hoverIndex
        props.move(dragIndex, hoverIndex)
        props.item.lastReplaced = props.currentId;
        return
    }
    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        if (hoverClientY + 8 > hoverMiddleY + hoverMiddleY) return;
        props.item.index = hoverIndex
        props.move(dragIndex, hoverIndex)
        props.item.lastReplaced = props.currentId;
        return
    }
}

function horizontal(props: Props) {
    const dragIndex = props.item.index
    const hoverIndex = props.index

    const hoverBoundingRect = props.ref.current?.getBoundingClientRect()
    const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2

    // Determine mouse position
    const clientOffset = props.monitor.getClientOffset()
    // Get pixels to the top
    const hoverClientY = clientOffset.x - hoverBoundingRect.left

    // Dragging right
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleX) {
        if (hoverClientY - 24 < 0) return;
        props.move(dragIndex, hoverIndex)
        props.item.index = hoverIndex
        return
    }
    // Dragging left
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleX) {
        if (hoverClientY + 24 > hoverMiddleX + hoverMiddleX) return;
        props.move(dragIndex, hoverIndex)
        props.item.index = hoverIndex
        return
    }
}