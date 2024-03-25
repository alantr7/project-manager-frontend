import { useAuth } from '@/hooks/useAuth';
import style from './AccountButton.module.scss';
import { useRef, useState } from 'react';
import { useFocus } from '@/hooks/useFocus';
import { useRouter } from 'next/router';
import { ImageUploadModal } from '../modals/ImageUploadModal';

export function AccountButton() {

    const { name, email, avatar, updatePassword, logout } = useAuth();
    const [isExpanded, setExpanded] = useState(false);
    const [isChangingAvatar, setChangingAvatar] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useFocus(ref, { 
        autoFocus: true,
        blur: () => setExpanded(!isExpanded),
        filter(element, util) {
            return !element.classList.contains(style.account);
        },
    }, [ isExpanded ]);

    function handleChangePassword() {
        const input = prompt("Enter a new password:");
        if (input) {
            updatePassword(input);
        }
    }

    function handleChangeAvatar() {
        setChangingAvatar(true);
    }

    return <>
        <button className={style.account} onClick={() => setExpanded(!isExpanded)}>
            <span style={{ backgroundImage: `url(${avatar})` }}></span>
            <span>{name}</span>
        </button>

        {isExpanded && <div className={style.accountSettings} ref={ref}>
            <div className={style.overview}>
                <img src={avatar} />
                <div>
                    <p className={style.name}>{name}</p>
                    <p className={style.email}>{email}</p>
                </div>
            </div>
            <hr />
            <div className={style.buttons}>
                <button className={style.changePassword} onClick={handleChangePassword}>Change Password</button>
                <button className={style.changeAvatar} onClick={handleChangeAvatar}>Change Avatar</button>
                <button className={style.apiKeys} disabled>API Keys</button>
                <hr />
                <button className={style.logout} onClick={logout}>Log Out</button>
            </div>
        </div>}

        {isChangingAvatar && <ImageUploadModal close={() => setChangingAvatar(false)} />}
    </>
}