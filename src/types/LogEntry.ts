import { User } from "./User";

export type LogEntryAction = "OPEN_ISSUE" | "CLOSE_ISSUE" | "CREATE_BUILD";

export interface LogEntry {
    id: number,
    action: LogEntryAction,
    user: User,
    contextual_id: string | null,
    contextual_data: any,
    timestamp: number
}