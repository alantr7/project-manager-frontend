import { Issue } from './Issue';
import { Project } from './Project';
import { ProjectFile } from './ProjectFile';

export type Build = {
    id: number,
    build: number,
    version: string,
    creationDate: string,

    changelog: {
        type: "issue_ref" | "text",
        issue?: Issue,
        text?: string,
    }[],
    files: ProjectFile[],

    project?: Project,
    author: {
        name: string,
        avatar: string
    }
}