import { BoardCard } from "./BoardCard";

export interface BoardList {
    id: number;
    name: string;
    cards: BoardCard[]
}