import { Group } from "@/types/Group";
import { Label } from "@/types/Label";
import { Project } from "@/types/Project";
import React from "react";
import {Notification} from "@/types/Notification";
import {Workspace} from "@/types/Workspace";

interface ProjectsContextType {
    // projects: Project[],
    workspace: Workspace,
    workspaces: Workspace[],
    groups: Group[],
    labels: Label[],
    isPageLoaded: boolean
}

export const AppContext = React.createContext<ProjectsContextType>({
    // projects: [],
    workspace: {name: "", weak_id: ""},
    workspaces: [],
    groups: [],
    labels: [],
    isPageLoaded: false,
});