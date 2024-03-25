import {Issue} from "@/types/Issue";

export interface MilestoneType {
    id: string,
    issues: Issue[],
    name: string,
    version: string,
    creationDate: string
}