import { Project } from "./Project"

export type Group = {
    id: number,
    name: string,
    icon: string,
    projects: Project[]
}