import { useEffect } from "react";
import { DragSourceHookSpec, FactoryOrInstance, useDrag, useDrop } from "react-dnd";

type Direction = "vertical" | "horizontal";

interface Props {
    direction: Direction,
    type: string,
    item(): any,
    end(): any
}

export function useRearrangeableList(propsCb: () => Props, deps: any[]) {
    const props = propsCb();
    useDrag(() => {
        return {
            type: props.type,
            item() {
                return props.item
            }
        }
    });

    useDrop(() => {
        return {
            accept: props.type,
            collect(monitor) {
                
            },
            hover(item, monitor) {
                
            },
            
        }
    });
}