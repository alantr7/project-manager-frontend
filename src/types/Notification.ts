import { Build } from "./Build"

export type Notification = {
    id: number,
    type: "new_build" | "text",
    date: string,
    text?: string,
    new_build?: Build
}