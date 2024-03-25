import { Issue } from "@/types/Issue"
import style from './IssueCard.module.scss';
import React, { Ref, RefObject, useRef } from "react";
import { createPortal } from "react-dom";
import { useFocus } from "@/hooks/useFocus";

interface IssueCardProps {
    left?: string,
    top?: string,
    issue: Issue,
    onBlur?(): void
}

export function IssueCard(props: IssueCardProps) {

    const ref = useRef<HTMLDivElement>(null);
    useFocus(ref, { autoFocus: true, blur: props.onBlur });

    return createPortal(<div className={style.issueCard} ref={ref} style={{left: props.left, top: props.top}}>
        <h3>{props.issue.title}</h3>
        <p>{props.issue.description || <span style={{textDecoration: 'cursive'}}>(No description provided)</span>}</p>
    </div>, document.body);
}