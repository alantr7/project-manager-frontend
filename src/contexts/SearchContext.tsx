import GlobalSearch from "@/components/GlobalSearch";
import React, { useState } from "react";

interface SearchContextProps {
    query: string;
    setQuery(query: string): void;
    isOpen: boolean;
    openModal(): void;
    closeModal(): void;
}

export const SearchContext = React.createContext<SearchContextProps>({
    query: '',
    setQuery: () => {},
    isOpen: false,
    openModal: () => {},
    closeModal: () => {}
});

export function SearchContextProvider(props: any) {
    const [ query, setQuery ] = useState('');
    const [ isOpen, setOpen ] = useState(false);

    return <SearchContext.Provider value={{
        isOpen: isOpen,
        openModal: () => setOpen(true),
        closeModal: () => setOpen(false),
        query,
        setQuery
    }}>
        {props.children}
        <GlobalSearch navigate={props.navigate} />
    </SearchContext.Provider>
}