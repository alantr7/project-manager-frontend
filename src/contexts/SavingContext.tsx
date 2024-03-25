import React, { useEffect } from "react";
import { useState } from "react";

interface SavingContextProps {
    isSaving: boolean,
    queue: number,
    put(id: string): void,
    remove(id: string): void
}

export const SavingContext = React.createContext<SavingContextProps>({
    isSaving: false,
    queue: 0,
    put(id: string) {},
    remove(id: string) {}
});

export function SavingProvider({children}: any) {
    const [ queue, setQueue ] = useState<string[]>([]);
    const [ isSaving, setSaving ] = useState(false);

    function put(id: string) {
        setQueue([...queue, id]);
        setSaving(true);

        console.log(queue);
    }

    function remove(id: string) {
        setQueue(queue => {
            let removed = false;

            const upd = queue.filter(it => {
                if (removed) return true;
                if (it === id) {
                    return !(removed = true);
                } else {
                    console.log(`${it} != ${id}`);
                }
            });

            setSaving(upd.length > 0);
            return upd;
        });
    }
    
    return <SavingContext.Provider value={{
        isSaving,
        queue: queue.length,
        put, 
        remove
    }}>
        {children}
    </SavingContext.Provider>
}