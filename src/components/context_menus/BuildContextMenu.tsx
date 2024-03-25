import { useState } from "react";
import { ContextMenu, MenuItem } from "../ContextMenu";

interface BuildContextMenuProps {
    top: number,
    close(): void,
    deleteBuild?(): void
}

export function BuildContextMenu(props: BuildContextMenuProps) {
    return <ContextMenu isVisible={true} right={'204px'} top={`${props.top + 4}px`} close={props.close}>
        <MenuItem onClick={() => (props.deleteBuild && props.deleteBuild(), props.close())}>Delete Build</MenuItem>
    </ContextMenu>
}