import { useStore } from 'react-redux';
import style from './Content.module.scss'
import { SyntheticEvent, useContext, useEffect, useState } from 'react';
import { ProjectContext } from '@/layouts/ProjectLayout';
import { NextRouter, useRouter } from 'next/router';
import Releases from './tabs/ReleasesTab';
import Issues from './tabs/issues';
import {AppContext} from "@/contexts/ProjectsContext";

interface TabButtonProps {
    tab: string,
    content: string,
    counter?: number,
    onClick?(): void,
    children?: any
}

export function TabButton({ tab, content, counter, onClick }: TabButtonProps) {
    const router = useRouter();
    const { tab: currentTab } = router.query;
    const app = useContext(AppContext);
    
    console.log(`Current Tab: ${currentTab}`);
    const { project } = router.query;
    const projectData = useContext(ProjectContext);

    const taba = tab as string;

    function handleClick() {
        if (onClick) {
            onClick();
            return;
        }

        router.push(`/w/${app.workspace.weak_id}/p/${project}/${tab}`);
    }
    
    { /* @ts-ignore */ }
    return <button className={style.tabButton + ' ' + style[tab] + ' ' + (tab === currentTab ? style.active : '')} onClick={handleClick}>
        {content}
        {counter !== undefined && <span className={style.counter}>{counter}</span>}
    </button>
}