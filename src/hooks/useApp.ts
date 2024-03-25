import {useCallback, useContext} from "react";
import {AppContext} from "@/contexts/ProjectsContext";

export function useApp() {
    const appContext = useContext(AppContext);

    const getProject = useCallback((id: string) => {
        for (const group of appContext.groups) {
            for (const project of group.projects)
                if (project.id === id)
                    return project;
        }

        return null;
    }, [ appContext.groups ]);

    return {
        getProject
    }

}