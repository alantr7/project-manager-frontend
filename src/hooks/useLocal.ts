import {useEffect, useState} from "react";

type UseLocalReturn = [
    string | null,
    UseLocalSet
];

type UseLocalSet = (value: string) => void;

export function useLocal(key: string, defaultValue: string | null = null) {
    const [ value, setValue ] = useState<string | null>(defaultValue);
    useEffect(() => {
        setValue(window.localStorage.getItem(key));
    }, []);


    function persistValue(value: string) {
        window.localStorage.setItem(key, value);
        setValue(value);
    }

    return [
        value,
        persistValue
    ]
}