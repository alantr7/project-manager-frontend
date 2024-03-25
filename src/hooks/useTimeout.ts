import { useState } from "react";

interface TimeoutProps {
    timeout: number
}

export function useTimeout(callback: () => void, props: TimeoutProps) {
    const [ timeoutId, setTimeoutId ] = useState<any>(null);

    const start = () => {
        setTimeoutId(setTimeout(() => {
            callback();
            setTimeoutId(null);
        }, props.timeout));
    }

    const stop = () => {
        clearTimeout(timeoutId);
        setTimeoutId(null);
    }

    return {
        timeoutId,
        start,
        stop,
        isActive: timeoutId !== null
    }
}