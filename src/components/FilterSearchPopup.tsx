import style from './FilterSearchPopup.module.scss';
import Checkbox from "@/components/Checkbox";
import {useContext, useState} from "react";
import {ProjectContext} from "@/layouts/ProjectLayout";
import {AppContext} from "@/contexts/ProjectsContext";
import {useApp} from "@/hooks/useApp";

export default function FilterSearchPopup() {
    const projects = useContext(AppContext).groups.map(g => g.projects).flatMap(g => g);
    const [selected, setSelected] = useState<{ [key: string]: boolean }>({});

    const select = (id: string, flag: boolean) => {
        setSelected(prev => {
            if (flag) {
                prev[id] = true;
            } else {
                delete prev[id];
            }

            return { ...prev };
        });
    }

    return <div className={style.popup}>
        <input type={"text"}/>
        <hr/>
        <div className={style.container}>
            {Object.entries(selected).map(([k, v]) => <div className={style.item} onClick={() => select(k, false)}>
                <Checkbox checked={true}/>{projects.find(p => p.id === k)?.name}
            </div>)}
        </div>
        <hr/>
        <div className={style.container}>
            {projects.slice(0, Math.min(projects.length, 8))
                .filter(project => !selected[project.id])
                .map(project => <div className={style.item} onClick={() => select(project.id, true)}>
                    <Checkbox/>{project.name}
                </div>)}
        </div>
    </div>
}