import style from "@/components/tabs/ReleasesTab.module.scss"

function Release() {

    return <div className={style.release}>
        <div className={style.header}>
            <span className={style.version}>v1.0.0</span>
            <span className={style.title}>DerDungeons</span>

            <p className={style.releaseDate}>Published on 15.04.2023. at 12.53PM</p>
        </div>
        
        <div className={style.section + ' ' + style.changelog}>
            <p className={style.title}>Changelog</p>
            <ul>
                <li>Issue <span className={style.issue}>Entites are not spawning in timed dungeons</span></li>
                <li>Issue <span className={style.issue}>Dungeon doors do not close when it&apos;s completed</span></li>
                <li>Issue <span className={style.issue}>Can not set boss in editor</span></li>
                <li>Issue <span className={style.issue}>Mobs disappear after a while</span></li>
            </ul>
        </div>

        <div className={style.section + ' ' + style.changelog}>
            <p className={style.title}>Files</p>
            <table>
                <tr>
                    <td>derdungeons-v1.0.5.jar</td>
                    <td>53 KB</td>
                    <td><a href='#'>Download</a></td>
                </tr>
            </table>
        </div>

    </div>

}

export default function Releases() {

    return <div className={style.releases}>
        <Release />
        <hr />
        <Release />
        <hr />
        <Release />
    </div>;

}