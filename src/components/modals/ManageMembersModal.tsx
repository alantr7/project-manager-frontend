import {Modal} from "./Modal";
import style from './ManageMembersModal.module.scss';
import TextInput from "../TextInput";
import {SetStateAction, useContext, useRef, useState} from "react";
import {api} from "@/pages/_app";
import {AppContext} from "@/contexts/ProjectsContext";
import axios from "axios";
import {User} from "@/types/User";
import defaultPic from '@/../public/default-avatar.png';
import {InviteCollaboratorModal} from "@/components/modals/InviteCollaboratorModal";
import {useFetch} from "@/hooks/useFetch";
import {InlineLoader} from "@/components/loader/InlineLoader";

type TabLike = "members" | "pending" | "blocked";

interface InviteCollaboratorModalProps {
    close?(): void
}

export function ManageMembersModal(props: InviteCollaboratorModalProps) {
    const [email, setEmail] = useState("");
    const {workspace} = useContext(AppContext);
    const [isInviting, setIsInviting] = useState(false);
    const [tab, setTab] = useState<TabLike>("members");

    const [members, setMembers] = useState<User[]>([]);
    const [pending, setPending] = useState<User[]>([]);
    const [blocked, setBlocked] = useState<User[]>([]);

    function filtered(users: User[]) {
        return users.filter(user => user.name.toLowerCase().includes(email.toLowerCase()));
    }

    const fetchMembers = useFetch(api, api => api.get(`/v1/workspaces/${workspace.weak_id}/members`).then(r => {
        setMembers(r.data.members);
        setPending(r.data.pending);
        setBlocked(r.data.blocked);
    }), {autoFetch: true});

    return <Modal isOpen={true} className={style.modal} onRequestClose={props.close}>
        <h2>Manage Members</h2>
        <div className={style.filter}>
            <button className={tab === "members" ? style.selected : ''} onClick={() => setTab("members")}
                    data-count={members.length}>Members
            </button>
            <button className={tab === "pending" ? style.selected : ''} onClick={() => setTab("pending")}
                    data-count={pending.length}>Pending
            </button>
            <button className={tab === "blocked" ? style.selected : ''} onClick={() => setTab("blocked")}
                    data-count={blocked.length}>Blocked
            </button>
        </div>
        <hr color={"#E8E8E8"}/>
        <TextInput valueProvider={email} valueSetter={setEmail} placeholder="Find users by name or email address"
                   autoFocus={true}/>

        <div className={style.users}>
            {fetchMembers.isFetching && <InlineLoader style={{marginLeft: '16px'}}>Loading members...</InlineLoader>}
            {tab === "members" && filtered(members).map(user => <Member key={user.name} data={user} tab={tab}
                                                                        setMembers={setMembers}/>)}
            {tab === "pending" && filtered(pending).map(user => <Member key={user.name} data={user} tab={tab}
                                                                        setMembers={setPending}/>)}
        </div>

        <hr color={"#E8E8E8"}/>
        <button className={style.invite} onClick={() => setIsInviting(true)}>Invite People</button>

        {isInviting && <InviteCollaboratorModal close={() => setIsInviting(false)}/>}
    </Modal>
}

function Member({data, tab, setMembers}: {
    data: User,
    tab: TabLike,
    setMembers: (members: SetStateAction<User[]>) => void
}) {
    const [isUpdating, setIsUpdating] = useState(false);
    const {workspace} = useContext(AppContext);

    function handleRemove() {
        const url = tab === 'members' ? `/v1/workspaces/${workspace.weak_id}/members/${data.id}`
            : tab === 'pending' ? `/v1/workspaces/${workspace.weak_id}/invitations/${data.id}`
                : undefined;

        if (url === undefined)
            return;

        setIsUpdating(true);

        api.delete(url).then(() => {
            setMembers(users => users.filter(user => user.id !== data.id));
        }).finally(() => {
            setIsUpdating(false);
        });

    }

    return <div className={`${style.user} ${isUpdating && style.updating}`}>
        <img src={data.avatar}/>
        <div className={style.details}>
            <p>{data.name}</p>
            <small>Collaborator</small>
        </div>
        <button onClick={handleRemove} disabled={isUpdating}/>
    </div>
}