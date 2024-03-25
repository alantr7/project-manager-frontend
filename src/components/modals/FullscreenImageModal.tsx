import React, { SyntheticEvent, useEffect, useRef, useState } from "react"
import ReactModal from "react-modal"
import style from "./FullscreenImageModal.module.scss";
import { Modal } from "./Modal";

interface FullscreenImageModalProps {
    source: string;
    isOpen: boolean;
    close(): void;
}

interface FullscreenImageContextProps {
    current: string;
    show(source: string): void;
}

function FullscreenImageModal(props: FullscreenImageModalProps) {

    const [resolution, setResolution] = useState<[number | string, number | string]>([0, 0]);

    useEffect(() => {
        const image = new Image();
        image.onload = e => {
            if (image.width > image.height) {
                setResolution([`${Math.min(image.width, 1100)}px`, 'auto'])
            } else {
                setResolution(['auto', `${Math.min(image.height, 720)}px`]);
            }
        }
        image.src = props.source;
    }, [ props.source ]);

    // return <ReactModal isOpen={props.isOpen} overlayClassName={`modal-overlay ${style.imageModalOverlay} ${isClosing ? style.closing : ''}`} className={`${style.imageModal} ${isClosing ? style.closing : ''}`} onRequestClose={handleClose} shouldCloseOnOverlayClick={true}>
    return <Modal isOpen={props.isOpen} overlayClassName={`modal-overlay ${style.imageModalOverlay}`} className={style.imageModal} onRequestClose={props.close} shouldCloseOnOverlayClick={true}>
        {props.source && <img src={props.source} width={resolution[0]} height={resolution[1]} />}
    </Modal>

}

export const FullscreenImageContext = React.createContext<FullscreenImageContextProps>({
    current: '',
    show(source) {
    },
});

export function FullscreenImageContextProvider(props: any) {
    const [isOpen, setOpen] = useState(false);
    const [source, setSource] = useState('');

    function show(source: string) {
        setSource(source);
        setOpen(true);
    }

    return <FullscreenImageContext.Provider value={{ current: source, show }}>
        {props.children}
        <FullscreenImageModal source={source} isOpen={isOpen} close={() => setOpen(false)} />
    </FullscreenImageContext.Provider>
}