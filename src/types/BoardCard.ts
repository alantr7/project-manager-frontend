import { Issue } from "./Issue";

export interface BoardCard {
    id: number;
    issue: Issue,
    project: string
}