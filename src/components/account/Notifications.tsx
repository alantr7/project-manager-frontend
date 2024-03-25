import { useEffect, useRef, useState } from "react";
import accountStyle from "./Account.module.scss";
import style from './Notifications.module.scss';
import { useFocus } from "@/hooks/useFocus";
import { Notification } from "@/types/Notification";
import { useFetch } from "@/hooks/useFetch";
import { api } from "@/pages/_app";
import axios from "axios";
import { formatDate } from "@/utils/formatDate";
import { useRouter } from "next/router";
import { getDifference } from "@/utils/formatDate";
import {InlineLoader} from "@/components/loader/InlineLoader";

export function Notification({ data }: { data: Notification }) {

    const router = useRouter();

    function handleClick() {
        if (data.type === "new_build") {
            router.push(`/project/${data.new_build?.project?.id}/builds#${data.new_build?.build}`);
        }
    }

    return <div className={style.notification} onClick={handleClick}>
        <a className={style.thumbnail}></a>
        {data.type === "text" && <p className={style.content}>{data.text}</p>}
        {data.type === "new_build" && <div className={style.content}>
            <p>{data.new_build?.project?.name} updated to v{data.new_build?.version}</p>
            <p className={style.source}>{data.new_build?.author.name} • <span className={style.date}>{formatDate(data.date)}</span></p>
        </div>}
    </div>

}

export default function NotificationsButton() {
    const [notificationsShown, setNotificationsShown] = useState(false);
    const [read, setRead] = useState(0);

    const boxRef = useRef<HTMLDivElement>(null);

    const [lastSeen, setLastSeen] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [groups, setGroups] = useState<Notification[][]>([[], [], []]);

    function toggleNotifications() {
        if (!notificationsShown && notifications.length > 0)
            api.post(`/v1/users/me/notifications/seen`, axios.toFormData({ notification: notifications[0].id }));

        setNotificationsShown(!notificationsShown);
    }

    const notifFetch = useFetch(api, axios => axios.get(`/v1/users/me/notifications`).then(r => {
        setNotifications(r.data.notifications);
        setRead(r.data.notifications.length - r.data.unseen_count);
        setLastSeen(r.data.last_seen);
    }), { autoFetch: true });

    useEffect(() => {
        const groups: Notification[][] = [[], [], []];
        notifications.forEach(notif => {
            if (notif.id > lastSeen) {
                groups[0].push(notif);
            } else {
                const diff = getDifference(new Date(notif.date), new Date());
                if (diff.months === 0) {
                    groups[1].push(notif);
                } else {
                    groups[2].push(notif);
                }
            }
        });

        setGroups(groups);

        console.log(`Did it :D: ${notifications.length}, groups[0]: ${groups[1].length}`);
    }, [notifications]);

    useFocus(boxRef, {
        autoFocus: true,
        hideOutline: true,
        focus() {
            setRead(notifications.length);
        },
        blur() {
            setNotificationsShown(false);
        },
        filter(element, util) {
            return !element.classList.contains(accountStyle.notificationsButton);
        },
    }, [notificationsShown]);

    return <>
        <button className={accountStyle.notificationsButton} onClick={toggleNotifications} notif-count={notifications.length - read}></button>
        {notificationsShown && <div className={style.notifications} ref={boxRef}>
            <div className={style.notificationsList}>
                {/* {notifications.map(not => <Notification key={not.id} data={not} />)} */}
                {notifFetch.isFetching && <InlineLoader style={{marginLeft: '20px'}}>Loading notifications</InlineLoader>}
                {groups.map((group, index) => {
                    if (group.length === 0)
                        return undefined;

                    return <div key={index}>
                        <p className={style.header}>{index === 0 ? 'Unseen' : index === 1 ? 'Recent' : 'Old'}</p>
                        {group.map(notif => {
                            return <Notification key={notif.id} data={notif} />
                        })}
                        <hr />
                    </div>
                })}
            </div>
        </div>}
    </>;
}