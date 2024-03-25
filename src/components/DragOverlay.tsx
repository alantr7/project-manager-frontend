import { DragEventHandler, SyntheticEvent } from 'react';
import style from './DragOverlay.module.scss';

interface DragOverlayProps {
    text?: string,
    onDrop?: DragEventHandler<HTMLDivElement>;
    onDragEnd?(): void
    onDragLeave?(): void
}

export function DragOverlay(props: DragOverlayProps) {
    return <div className={style.overlay}
        onDragLeave={() => props.onDragLeave && props.onDragLeave()}
        onDragEnd={() => props.onDragEnd && props.onDragEnd()}
        onDrop={props.onDrop}
    >
        {props.text || "Drop your file here"}
    </div>
}