import { LogEntry } from "@/types/LogEntry";

export function formatLogEntryMessage(entry: LogEntry) {
    switch (entry.action) {
        case "OPEN_ISSUE": return `${entry.user.name} created an issue`;
        case "CLOSE_ISSUE": return `${entry.user.name} closed an issue`;
        case "CREATE_BUILD": return `${entry.user.name} created build <strong>${entry.contextual_data.version}</strong> for ${entry.contextual_data.project_name}`;
    }
}