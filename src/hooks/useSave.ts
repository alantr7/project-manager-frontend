import { SavingContext } from "@/contexts/SavingContext";
import { useContext, useEffect, useState } from "react";

interface SaveProps {

}

interface SaveResponse {
    isSaving: boolean,
    save<T>(cb: (() => T) | Promise<T>): T
}

export function useSave(id: string): SaveResponse {
    const context = useContext(SavingContext);
    const [ isSaving, setSaving ] = useState(false);

    function save<T>(cb: () => (void | Promise<T> | any)): T {

        setSaving(true);
        context.put(id);
        
        const result = cb instanceof Promise ? cb : cb();

        if (result instanceof Promise) {
            const promise = result as Promise<any>;
            promise.finally(() => {
                setSaving(false);
                context.remove(id);
            });
        } else {
            context.remove(id);
            setSaving(false);
        }

        return result;

    }

    return {
        isSaving,
        save
    }
}