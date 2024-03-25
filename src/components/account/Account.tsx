import { useContext, useState } from 'react';
import style from './Account.module.scss';
import { useAuth } from '@/hooks/useAuth';
import ThemeSwitchButton from './ThemeSwitchButton';
import NotificationsButton from './Notifications';
import { SearchContext } from '@/contexts/SearchContext';
import SavingIndicator from './SavingIndicator';
import { InviteCollaboratorModal } from '../modals/InviteCollaboratorModal';
import { CreateProjectModal } from '../modals/CreateProjectModal';
import { AccountButton } from './AccountButton';
import PendingInvitesButton from "@/components/account/PendingInvites";

export default function Account() {

    const search = useContext(SearchContext);

    function toggleFullWidth() {
        const body = document.body;
        if (body.attributes.getNamedItem('layout'))
            body.removeAttribute('layout');
        else {
            body.setAttribute('layout', 'full-width');
        }
    }

    return <div className={style.accountSection}>
        <SavingIndicator />
        <button className={style.searchButton} onClick={() => search.openModal()}>Search...</button>
        <ThemeSwitchButton />
        <PendingInvitesButton />
        <NotificationsButton />
        <AccountButton />
    </div>

}