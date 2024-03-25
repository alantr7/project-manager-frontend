import Account from '../account/Account';
import { AccountButton } from '../account/AccountButton';
import NotificationsButton from '../account/Notifications';
import style from './Navbar.module.scss';

interface NavbarProps {
    children?: any
}

export default function Navbar(props: NavbarProps) {
    return <div className={style.navbar}>
        <div className={style.location}>
            {props.children}
        </div>
        <div>
            <Account />
        </div>
    </div>
}