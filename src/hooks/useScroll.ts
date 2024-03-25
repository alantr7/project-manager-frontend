import { useState } from "react";

let registered = false;
let handlers = [] as ((event: Event) => void)[];

export function useScroll() {
    if (!registered) {
        document.body.onscroll = e => {
            const target = (e.target as Document).scrollingElement as HTMLElement;
            handlers.forEach(handle => handle(e));
        }
        registered = true;
    }

    return {
        handle(handler: (e: Event) => void) {
            handlers.push(handler);
        }
    }
}