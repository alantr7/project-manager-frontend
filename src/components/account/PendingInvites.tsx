import {SetStateAction, useEffect, useRef, useState} from "react";
import accountStyle from "./Account.module.scss";
import style from './PendingInvites.module.scss';
import {useFocus} from "@/hooks/useFocus";
import {useFetch} from "@/hooks/useFetch";
import {api} from "@/pages/_app";
import {useRouter} from "next/router";
import {InlineLoader} from "@/components/loader/InlineLoader";
import {User} from "@/types/User";
import {Workspace} from "@/types/Workspace";

export function Notification({data, setInvites}: { data: PendingInvite, setInvites: (invites: SetStateAction<PendingInvite[]>) => void }) {

    const router = useRouter();
    const [isResponding, setIsResponding] = useState(false);

    function handleAccept() {
        setIsResponding(true);
        api.post(`/v1/workspaces/${data.workspace.weak_id}/invitations/${data.id}/accept`).then(() => {
            setInvites(invites => invites.filter(inv => inv.id !== data.id));
        }).catch(() => {

        }).finally(() => {
            setIsResponding(false);
        })
    }

    function handleDecline() {
        setIsResponding(true);
        api.post(`/v1/workspaces/${data.workspace.weak_id}/invitations/${data.id}/decline`).then(() => {
            setInvites(invites => invites.filter(inv => inv.id !== data.id));
        }).catch(() => {}).finally(() => {
            setIsResponding(false);
        })
    }

    return <div className={style.notification}>
        <a className={style.thumbnail}></a>
        <div className={style.content}>
            <p>{data.author.name} has invited you to join {data.workspace.name}!</p>
            <div className={style.actions}>
                {!isResponding && <>
                    <button className={style.accept} onClick={handleAccept}>Accept</button>
                    <button className={style.decline} onClick={handleDecline}>Decline</button>
                </>}
            </div>
            {isResponding && <InlineLoader>Please wait...</InlineLoader>}
        </div>
    </div>

}

interface PendingInvite {
    author: User,
    id: number,
    workspace: Workspace
}

export default function PendingInvitesButton() {
    const [notificationsShown, setNotificationsShown] = useState(false);
    const [read, setRead] = useState(0);

    const boxRef = useRef<HTMLDivElement>(null);

    const [invites, setInvites] = useState<PendingInvite[]>([]);

    function toggleNotifications() {
        setNotificationsShown(!notificationsShown);
    }

    const notifFetch = useFetch(api, axios => axios.get(`/v1/users/me/invitations`).then(r => {
        setInvites(r.data);
    }), {autoFetch: true});

    useFocus(boxRef, {
        autoFocus: true,
        hideOutline: true,
        focus() {
        },
        blur() {
            setNotificationsShown(false);
        },
        filter(element, util) {
            return !element.classList.contains(style.button);
        },
    }, [notificationsShown]);

    return <>
        <button className={style.button} onClick={toggleNotifications}
                notif-count={invites.length}></button>
        {notificationsShown && <div className={style.notifications} ref={boxRef}>
            <div className={style.notificationsList}>
                {/* {notifications.map(not => <Notification key={not.id} data={not} />)} */}
                <p className={style.header}>Pending Invites</p>
                <hr/>
                {notifFetch.isFetching &&
                    <InlineLoader style={{marginLeft: '20px'}}>Loading invites</InlineLoader>}
                {!notifFetch.isFetching && <div>
                    {invites.map(invite => <Notification key={invite.id} data={invite} setInvites={setInvites} />)}
                </div>}
            </div>
        </div>}
    </>;
}