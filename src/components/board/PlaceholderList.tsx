import { repeatUsing } from '@/utils/repeatable';
import style from '../../pages/w/[workspace]/board.module.scss';

function PlaceholderCard() {
    return <div className={style.card}>
        <div className={style.labels}>
            <span style={{ color: 'transparent', backgroundColor: 'rgba(0, 0, 0, .2)' }}>hidden :D</span>
            <span>also hidden :DD</span>
        </div>
        <span>also hidden :DDD</span>
    </div>
}

export function PlaceholderList() {

    const cards = repeatUsing([] as any[], arr => { arr.push(<PlaceholderCard />) }, Math.random() * 6 + 2);

    return <div className={`${style.list} ${style.placeholder}`}>
        <p className={style.title}></p>
        <div className={style.cards}>
            {cards}
        </div>
    </div>

}