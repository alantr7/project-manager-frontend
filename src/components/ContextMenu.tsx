import { useFocus } from "@/hooks/useFocus";
import React, { Component, useEffect, useRef, useState } from "react";
import style from './ContextMenu.module.scss';
import { createPortal } from "react-dom";

interface ContextMenuProps {
    isVisible: boolean,
    children?: any,
    className?: string,
    top?: number | string,
    right?: number | string,
    left?: number | string,
    width?: number | string,
    height?: number | string,
    close(): void
}

export function ContextMenu(props: ContextMenuProps) {
    const ref = useRef<HTMLDivElement>(null);
    useFocus(ref, { autoFocus: true, hideOutline: true, blur: props.close });

    return createPortal(
        <div ref={ref} className={`${style.contextMenu} ${props.className}`} onClick={e => e.stopPropagation()} style={{ left: props.left, top: props.top, right: props.right, width: props.width, height: props.height }}>
            {props.children}
        </div>
        , document.body);
}

interface MenuItemProps {
    className?: string,
    children: string,
    icon?: string,
    iconSize?: [string | undefined, string | undefined],
    onClick?(): void
}

export function MenuItem(props: MenuItemProps) {
    return <div className={`${style.item} ${props.className && props.className}`} onClick={props.onClick}>
        {props.icon && <div className={style.imgContainer}>
            <img src={props.icon} style={{width: props.iconSize && props.iconSize[0], height: props.iconSize && props.iconSize[1]}} />
        </div>}
        {props.children}
    </div>
}

interface MenuItemGroupProps {
    children: any,
    text: string,
    icon?: string
}

export function MenuItemGroup(props: MenuItemGroupProps) {
    const [isExpanded, setExpanded] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const [offset, setOffset] = useState<[number, number]>([0, 0]);
    const [ expandedChild, setExpandedChild ] = useState(-1);

    useEffect(() => {
        if (ref.current === null)
            return;

        const parent = ref.current.parentElement?.classList.contains(style.itemWrapper)
            ? ref.current.parentElement.parentElement
            : ref.current.parentElement;

        setOffset([ (parent?.offsetLeft || 0) + (parent?.clientWidth || 0), (parent?.offsetTop) || 0 ]);
        if (ref.current.getAttribute('data-expanded')) {
            setExpanded(true);
        }
    }, [ref]);

    return <div ref={ref} className={`${style.item}`} onClick={() => setExpanded(true)} onMouseOut={() => setExpanded(true)} style={{ position: 'relative' }}>
        {props.text}
        <span className={style.arrow}>{">"}</span>
        {isExpanded && <div className={style.contextMenu} style={{
            left: `${offset[0]}px`,
            top: `${offset[1]}px`
        }
        }>
            {props.children.map && props.children.map((child: any, index: number) => {
                return <div key={child.key} className={style.itemWrapper} onMouseOver={() => setExpandedChild(index)} data-expanded={expandedChild === index}>{child}</div>
            }) || props.children}
        </div>}
    </div>
}