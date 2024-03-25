import { useSave } from '@/hooks/useSave';
import style from './Account.module.scss';
import { useContext } from 'react';
import { SavingContext } from '@/contexts/SavingContext';

export default function SavingIndicator() {
    const { save: perform } = useSave('test');
    const { queue, isSaving } = useContext(SavingContext);

    function handleClick() {
        perform(() => {
            return new Promise<boolean>((resolve, reject) => {
                setTimeout(() => {
                    resolve(true);
                }, 2000);
            })
        });
    }

    return <a className={style.savingIndicator} onClick={handleClick}>
        {isSaving ? <>
            <p className={style.saving}>Saving</p>
        </> : ''}
    </a>
}