import {ContextMenu, MenuItem} from "../ContextMenu";
import contextStyle from '../ContextMenu.module.scss';
import iconBoard from '../../../public/issue-board.png';
import iconMilestone from '../../../public/icon-milestone.png';
import iconActivities from '../../../public/recent.png';
import iconAddProject from '../../../public/add-project.png';
import iconAddMember from '../../../public/user.png';
import iconRename from '../../../public/edit.png';
import iconLeave from '../../../public/logout.png';
import iconDelete from '../../../public/delete.png';

interface ProjectGroupContextMenu {
    left: number,
    top: number,
    rename(): void,
    delete(): void,
    createProject(): void,
    close(): void
}

export function ProjectGroupContextMenu(props: ProjectGroupContextMenu) {
    return <ContextMenu isVisible={true} close={props.close} left={props.left + 'px'} top={props.top + 'px'}>
        <MenuItem icon={iconAddProject.src} className={contextStyle.item} onClick={() => (props.createProject(), props.close())}>Create Project</MenuItem>
        <hr />
        <MenuItem icon={iconRename.src} iconSize={["16px", "16px"]} className={contextStyle.item} onClick={() => (props.rename(), props.close())}>Rename Group</MenuItem>
        <MenuItem icon={iconDelete.src} iconSize={["16px", "16px"]} className={contextStyle.item} onClick={() => (props.delete(), props.close())}>Delete Group</MenuItem>
    </ContextMenu>
}