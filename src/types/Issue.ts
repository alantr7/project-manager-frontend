import { IssueTask } from "./IssueTask";
import { Label } from "./Label";
import { Project } from "./Project";
import { ProjectFile } from "./ProjectFile";

export type Issue = {
    id: number,
    title: string,
    description: string,
    labels: Label[],
    author: {
        name: string,
        avatar: string
    },
    resolved?: boolean,
    state: "DEFAULT" | "PROGRESS" | "RESOLVED",
    index: number,
    creationDate: string,
    project?: Project,
    attachments: ProjectFile[],
    tasks: IssueTask[]
};