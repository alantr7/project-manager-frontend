import Checkbox from '@/components/Checkbox';
import style from './ViewPopup.module.scss';

interface ViewPopup {
    close?(): void
}

export default function ViewPopup(props: ViewPopup) {
    return <div className={style.popup}>
        <div className={style.header}>
            <h3>View</h3>
            <button className={style.close} onClick={props.close}></button>
        </div>

        <div className={style.group}>
            <h3>Sort by</h3>
            <div className={style.options}>
                <button><Checkbox />Newest first</button>
                <button><Checkbox />Oldest first</button>
                <button><Checkbox />Recently updated</button>
            </div>
        </div>

        <div className={style.group}>
            <h3>Display</h3>
            <div className={style.options}>
                <button><Checkbox />Show attachments</button>
                <button><Checkbox />Show tasks</button>
            </div>
        </div>

        <div className={style.actionButtons}>
            <button className={style.apply}>Apply</button>
        </div>
    </div>
}