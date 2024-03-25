import { useContext, useState } from "react";
import {ContextMenu, MenuItem, MenuItemGroup} from "../ContextMenu";
import contextStyle from '../ContextMenu.module.scss';
import { EditProjectModal } from "../modals/EditProjectModal";
import { DropdownGroup, DropdownItem, DropdownMenu } from "../DropdownMenu";
import { AppContext } from "@/contexts/ProjectsContext";
import iconDelete from '../../../public/delete.png';

interface ProjectContextMenu {
    left: number,
    top: number,
    setCategory(category: number): void,
    editProject(): void,
    deleteProject(): void,
    close(): void
}

export function ProjectContextMenu(props: ProjectContextMenu) {
    const context = useContext(AppContext);

    return <ContextMenu left={props.left} top={props.top} isVisible={true} /*left={`${props.left}`} top={`${props.top}px`}*//* width={"228px"}= */ close={props.close} className={contextStyle.contextMenu}>
        <MenuItem className={contextStyle.item}>Change Icon</MenuItem>
        <MenuItem className={contextStyle.item} onClick={props.editProject}>Rename</MenuItem>
        <MenuItem className={contextStyle.item} onClick={props.editProject}>Set Category</MenuItem>
        <hr />
        <MenuItem className={contextStyle.item} icon={iconDelete.src} iconSize={["16px", "16px"]} onClick={props.deleteProject}>Delete Project</MenuItem>
        {/* <div className={contextStyle.item} onClick={() => (props.close(), props.deleteProject())}>Delete Project</div> */}
    </ContextMenu>
}