import { CSSProperties } from 'react';
import style from './InlineLoader.module.scss';

interface InlineLoaderProps {
    style?: CSSProperties,
    children?: string
}

export function InlineLoader(props: InlineLoaderProps) {
    return <div className={style.loader} style={props.style}>
        <p className={style.spinner}></p>
        <p>{props.children}</p>
    </div>
}