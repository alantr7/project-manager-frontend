import axios, { Axios } from "axios";
import { useEffect, useState } from "react";

interface UseFetchReturn<T> {
    isFetched: boolean;
    isFetching: boolean,
    fetch(): Promise<T>;
}

interface UseFetchOptions {
    autoFetch?: boolean
}

export function useFetch<T>(axios: Axios, cb: (axios: Axios) => Promise<T>, options: UseFetchOptions = {}): UseFetchReturn<T> {
    const [ isFetched, setFetched ] = useState(false);
    const [ isFetching, setFetching ] = useState<Promise<T>>();
    const [ isFetchActive, setFetchActive ] = useState(false);

    function fetch(): Promise<T> {
        if (isFetching && !isFetched)
            return isFetching;

        const promise = cb(axios);
        setFetching(promise);
        setFetched(false);
        setFetchActive(true);

        const proxy = new Promise<T>((resolve, reject) => {
            promise.then(resolve).catch(reject).finally(() => (setFetched(true), setFetchActive(false)));
        });

        return proxy;
    }

    useEffect(() => {
        if (options.autoFetch)
            fetch();
    }, []);

    return {
        isFetched,
        isFetching: isFetchActive,
        fetch
    }
}