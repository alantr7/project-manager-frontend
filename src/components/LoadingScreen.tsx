import { useEffect, useState } from 'react';
import style from './LoadingScreen.module.scss';

interface LoadingScreenProps {
    progress: number,
    text: string
}

export function LoadingScreen({progress = 0, text}: LoadingScreenProps) {
    const [ completed, setCompleted ] = useState(false);
    const [ hidden, setHidden ] = useState(false);

    useEffect(() => {
        setCompleted(progress === 100);
        if (progress === 100) {
            setTimeout(() => {
                setHidden(true);
            }, 1500);
        } else {
            setHidden(false);
        }
    }, [ progress ]);
    
    return hidden ? <></> : <div className={`${style.loadingScreenOverlay} ${completed && style.loaded}`}>
        <a className={style.splash}></a>
        <p className={style.progressText}>{text}</p>
        <div className={style.progressBarContainer}>
            <div className={style.progressBar} style={{width: `${progress}%`}}></div>
        </div>
    </div>
}