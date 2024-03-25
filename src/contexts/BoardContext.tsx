import React from "react";

interface BoardContextProps {
    draggedCard: any,
    setDraggedCard(card: any): void
}

export const BoardContext = React.createContext<BoardContextProps>({
    draggedCard: null,
    setDraggedCard(card) {
        this.draggedCard = card;
    },
});