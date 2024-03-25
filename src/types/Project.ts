import { ProjectFile } from "./ProjectFile";

export type Project = {
    id: string,
    name: string,
    latestBuild: number,
    latestFile: any | null,
    openIssues: number,
    closedIssues: number,
    files: ProjectFile[],
    icon: string,
    version: string,
    description: string,
    group: {
        id: number,
        name: string,
        icon: string
    },
    meta: {
        openIssues: number,
        closedIssues: number,
        builds: number,
        activeMilestones: number
    }
};