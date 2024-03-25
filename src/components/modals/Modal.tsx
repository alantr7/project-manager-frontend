import { KeyboardEvent, MouseEvent, useEffect, useState } from "react";
import ReactModal from "react-modal";

interface ModalProps extends ReactModal.Props {
    isClosing?: boolean
}

export function Modal(props: ModalProps) {
    const [isClosing, setClosing] = useState(props.isClosing === true);
    const onClose = (event: MouseEvent<Element, any> | KeyboardEvent<Element>) => {
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            if (props.onRequestClose)
                props.onRequestClose(event);
        }, 500);
    }

    useEffect(() => {
        setClosing(props.isClosing === true);
    }, [ props.isClosing ]);

    return <ReactModal
        {...props}
        onRequestClose={onClose}
        overlayClassName={`modal-overlay ${props.overlayClassName} ${isClosing ? `modal-overlay-closing` : ''}`}
        className={`modal ${props.className} ${isClosing ? `modal-closing` : ''}`}
    />
}