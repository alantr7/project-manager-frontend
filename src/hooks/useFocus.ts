import assert from "assert";
import { RefObject, useEffect } from "react";

interface FilterUtil {
    hasParent(condition: (parent: HTMLElement) => boolean, depth?: number): boolean
}

interface HookProps<T> {
    autoFocus?: boolean,
    hideOutline?: boolean,
    tabIndex?: number,
    focus?(ev: FocusEvent): void,
    blur?(ev: FocusEvent): void,
    filter?(element: HTMLElement, util: FilterUtil): boolean
}

export function useFocus<T extends HTMLElement>(ref: RefObject<T>, props: HookProps<T> = {}, deps: any[] = []) {
    function updateElement() {
        const element = ref.current;
        if (!element) {
            return;
        }

        if (props.focus) {
            element.onfocus = props.focus;
        }

        if (props.hideOutline) {
            element.style.outline = 'none';
        }

        if (props.blur) {
            element.onblur = (ev) => {
                assert(props.blur);
                console.log(ev);

                if (ev.relatedTarget && element.contains(ev.relatedTarget as HTMLElement)) {
                    return;
                }

                // @ts-ignore
                if (!ev.sourceCapabilities)
                    return;

                if (ev.relatedTarget && props.filter && !props.filter(ev.relatedTarget as HTMLElement, getFilterUtil(ev)))
                    return;

                props.blur(ev);
            };
        }

        if (props.autoFocus) {
            element.tabIndex = props.tabIndex || -1;
            element.focus();
        }
    }

    if (ref.current)
        updateElement();

    useEffect(updateElement, [...deps, ref.current]);
}

function getFilterUtil(ev: FocusEvent): FilterUtil {
    const related = ev.relatedTarget as HTMLElement;

    function hasParent(element: HTMLElement, condition: (element: HTMLElement) => boolean, pos: number, depth: number): boolean {
        const parent = element.parentElement as HTMLElement;
        if (condition(parent))
            return true;

        return pos < depth ? hasParent(parent, condition, pos + 1, depth) : false;
    }

    return {
        hasParent(condition, depth = 1) {
            return hasParent(related, condition, 1, depth);
        },
    }
}