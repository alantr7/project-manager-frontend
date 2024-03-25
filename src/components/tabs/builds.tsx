import style from '../../components/tabs/BuildsTab.module.scss';
import {ProjectContext} from '@/layouts/ProjectLayout'
import {api} from '@/pages/_app';
import {ProjectFile} from '@/types/ProjectFile';
import axios from 'axios';
import {useRouter} from 'next/router';
import React, {useContext, useEffect, useRef, useState} from 'react'
import {Card} from '../board/BoardCard';
import {BoardCard} from '@/types/BoardCard';
import {BoardList} from '@/types/BoardList';
import {CreateBuildModal} from '../modals/CreateBuildModal2';
import {useFetch} from '@/hooks/useFetch';
import {Build} from '@/types/Build';
import {formatDate} from '@/utils/formatDate';
import Image from 'next/image';
import {formatSize} from '@/utils/formatSize';
import ReactDropdown from 'react-dropdown';
import {BuildContextMenu} from '../context_menus/BuildContextMenu';
import {IssueCard} from '../IssueCard';
import {Issue} from '@/types/Issue';
import {useFocus} from '@/hooks/useFocus';
import {InlineLoader} from '../loader/InlineLoader';

export function Build({data, deleteBuild}: { data: Build, deleteBuild?(): void }) {

    const project = useContext(ProjectContext);
    const downloadURL = data.files[0]?.downloadURL;

    const [isContextMenuOpen, setContextMenuOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const [previewedIssue, setPreviewedIssue] = useState<Issue>();
    const previewedIssueRef = useRef<HTMLDivElement>(null);
    const [previewedIssuePos, setPreviewedIssuePos] = useState<[number, number]>([0, 0]);

    function handleDeleteBuild() {
        api.delete(`/v1/projects/${project.project.id}/builds/${data.id}`)
            .then(deleteBuild)
            .catch(() => {

            });
    }

    return <>
        <div className={style.build} id={data.build.toString()} ref={ref}>
            {/* <div className={style.actions}>
        <a href={downloadURL} download={data.files[0]?.name} />
      </div> */}

            <div className={style.header}>
                <span style={{paddingLeft: 0}}>{project.project.name}</span>
                <span className={style.buildNumber}>v{data.version}</span>
                <p className={style.labels}>
                    <button className={style.more} onClick={() => setContextMenuOpen(!isContextMenuOpen)}></button>
                </p>
            </div>

            <div className={style.section}>
                {/* <p className={style.header}>{data.project?.name} v0.8.0 </p> */}
                <p className={style.authorDate}><img className={style.avatar}
                                                     src={data.author?.avatar}></img>{data.author?.name} • {formatDate(data.creationDate)}
                </p>
                <ul>
                    {data.changelog.map(change => {
                        if (change.type === 'issue_ref')
                            return <li>
                                <button onClick={e => (
                                    setPreviewedIssue(change.issue),
                                        setPreviewedIssuePos([e.clientX, e.clientY])
                                )} className={style.issueReference}>{change.issue?.title}</button>
                            </li>
                        else
                            return <li>{change.text}</li>
                    })}
                </ul>

                {data.files.length > 0 && <>
                    <hr style={{marginLeft: '24px'}}/>
                    <div className={style.assets}>
                        {data.files.map(file => {
                            return <article key={file.id}>
                                <p><a href={file.downloadURL} download={file.name}>{file.name}</a></p>
                                <p>{formatSize(file.size)}</p>
                            </article>
                        })}
                    </div>
                </>}
            </div>
            {isContextMenuOpen &&
                <BuildContextMenu top={ref.current?.offsetTop || 0} close={() => setContextMenuOpen(false)}
                                  deleteBuild={handleDeleteBuild}/>}
            {previewedIssue !== undefined &&
                <IssueCard issue={previewedIssue} onBlur={() => setPreviewedIssue(undefined)}
                           left={`${previewedIssuePos[0] + 16}px`} top={`${previewedIssuePos[1] - 20}px`}/>}
        </div>
    </>
}

export default function Builds() {

    const {project} = useContext(ProjectContext);
    const router = useRouter();

    const [channel, setChannel] = useState<"Release" | "Development">("Release");
    const [builds, setBuilds] = useState<Build[]>([]);
    const dataFetch = useFetch(api, axios => axios.get(`/v1/projects/${project.id}/builds?channel=${channel.toLowerCase()}`).then(r => setBuilds(r.data)));

    useEffect(() => {
        dataFetch.fetch()
    }, [project, channel]);

    const [isCreatingBuild, setCreatingBuild] = useState(false);

    function handleCreateBuild(build: Build) {
        setBuilds([build, ...builds]);
    }

    return <div className={style.builds}>
        <div className={style.actionBar}>
            <div className={style.filters}>
                <div className={style.state}>
                    <button className={`${style.open} ${channel === "Release" && style.active}`}
                            onClick={() => setChannel("Release")}>Release
                    </button>
                    <button className={`${style.closed} ${channel === "Development" && style.active}`}
                            onClick={() => setChannel("Development")}>Develop
                    </button>
                </div>
                {/* <div className={style.filter}>
          <p className={style.filterLabel} role="version-select">Version:</p>
          <ReactDropdown options={["Latest", "v0.1.0", "v0.1.2"]} value="Latest" className={style.filterSelect} menuClassName={style.filterSelectMenu} arrowOpen={"V"} />
        </div> */}
            </div>
            <button className={style.createBuild} onClick={() => setCreatingBuild(true)}>Create Build</button>
        </div>

        {/* <hr style={{ marginTop: '2px' }} /> */}

        {!dataFetch.isFetched && <InlineLoader style={{ margin: '-7px 0 0 32px' }}>Loading builds...</InlineLoader>}
        {dataFetch.isFetched && <>
            {builds.length > 0 ? builds.map(build => <Build key={build.id} data={build}
                                                            deleteBuild={() => setBuilds(builds => builds.filter(b => b.id !== build.id))}/>) :
                <h4 style={{fontWeight: 'normal', paddingLeft: '26px'}}>There are no {channel} builds yet.</h4>}

            <CreateBuildModal isOpen={isCreatingBuild} createBuild={handleCreateBuild}
                              close={() => setCreatingBuild(false)}/>
        </>
        }
    </div>

}