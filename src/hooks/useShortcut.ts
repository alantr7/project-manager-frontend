import { useEffect } from "react";

export class ShortcutHandler {
    callback: null | ((event: KeyboardEvent) => void) = null;
    public readonly handle = (callback: (event: KeyboardEvent) => void) => {
        this.callback = callback;
    }
}

export function useShortcut(key: string, ignoreOtherFocusedElement = false, predicate: (event: KeyboardEvent) => boolean = e => true): ShortcutHandler {
    const handler = new ShortcutHandler();
    useEffect(() => {
        document.addEventListener('keydown', e => {
            const selected = document.querySelector(':focus');
            if (!ignoreOtherFocusedElement && selected && ['INPUT', 'TEXTAREA'].includes(selected.tagName))
                return;
                
            if (e.key === key && predicate(e)) {
                e.preventDefault();
                if (handler.callback !== null) {
                    handler.callback(e);
                }
            }
        })
    }, []);
    return handler;
}