import { Modal } from "./Modal";
import style from './ImageUploadModal.module.scss';
import TextInput from "../TextInput";
import { DragEvent, useEffect, useState } from "react";
import { DragOverlay } from "../DragOverlay";
import { Setter } from "@/types/Setter";
import { toURL } from "@/utils/toURL";
import { api } from "@/pages/_app";
import axios from "axios";
import { browseFiles } from "@/utils/browseFiles";
import { useRouter } from "next/router";
import { useTimeout } from "@/hooks/useTimeout";

interface ImageUploadProps {
    close: VoidFunction
}

export function ImageUploadModal(props: ImageUploadProps) {

    const [imageHref, setImageHref] = useState<string>();
    const [source, setSource] = useState<File | string>();

    const [step, setStep] = useState(0);

    return <Modal isOpen={true} className={style.modal} onRequestClose={props.close}>
        {step === 0 && <ImageUploadStep1 setImageHref={setImageHref} setSource={setSource} advance={() => setStep(2)} />}
        {step === 1 && <ImageUploadStep2 imageHref={imageHref} source={source} advance={() => setStep(2)} reset={() => (setStep(0), setSource(undefined), setImageHref(undefined))} />}
        {step === 2 && <ImageUploadStep3 imageHref={imageHref} source={source} reset={() => (setStep(0), setSource(undefined), setImageHref(undefined))} />}
    </Modal>

}

function ImageUploadStep1(props: { setImageHref: Setter<string>, setSource: Setter<File | string>, advance: () => void }) {
    const [isDraggingFile, setDraggingFile] = useState(false);
    const [link, setLink] = useState("");
    const [linkError, setLinkError] = useState("");

    function handleFileUpload(file: File) {
        const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif"];

        if (!ALLOWED.includes(file.type)) {
            alert('Invalid file type.');
            return;
        }

        toURL(file).then(checkImage).then(href => {
            // TODO: USE IMAGE CHECK!
            props.setImageHref(href);
            props.setSource(file);
            props.advance();
        }).catch(alert);
    }

    function handleFileDrop(ev: DragEvent) {
        ev.preventDefault();
        ev.nativeEvent.preventDefault();

        setDraggingFile(false);

        const files = ev.dataTransfer.files;
        if (files.length !== 1)
            return;

        handleFileUpload(files[0]);
    }

    function handleBrowseFiles() {
        browseFiles().then(files => {
            if (files.length !== 1)
                return;

            handleFileUpload(files[0]);
        })
    }

    function handleContinue() {
        if (link === undefined)
            return;

        checkImage(link).then(() => fetch(link).then(response => response.blob()).then(blob => {
            const file = new File([blob], `avatar.${blob.type.substring("image/".length)}`);
            props.setImageHref(link);
            props.setSource(file);
            props.advance();
        }));

        return;
    }

    const linkCheckTimeout = useTimeout(() => {
        // Check if the link is valid.
        if (link.trim().length === 0) {
            setLinkError("");
            return;
        }

        const protocol = link.indexOf('://');
        if (protocol === -1) {
            setLinkError("Invalid link provided.");
            return;
        }

        axios.get(link).then(() => {
            setLinkError("Image is ready to use.");
        }).catch(() => setLinkError("Access to the image has been denied."));

        setLinkError("");
    }, { timeout: 500 });

    useEffect(() => {
        linkCheckTimeout.stop();
        linkCheckTimeout.start();
    }, [link]);

    return <div className={style.screen1}>
        <h2>Change avatar</h2>

        <TextInput valueProvider={link} valueSetter={setLink} placeholder="Image link..." />
        <p className={`${style.linkError} ${linkError === "Image is ready to use." ? style.linkErrorValid : ""}`}>{linkError}</p>
        <hr />

        <section className={style.filebrowser} onDragOver={e => (e.preventDefault(), setDraggingFile(true))}>
            <p>...or simply upload a file.<br />You can also drag and drop files.</p>

            <button onClick={handleBrowseFiles}>Browse Files</button>
            {isDraggingFile && <DragOverlay onDragEnd={() => setDraggingFile(false)} onDragLeave={() => setDraggingFile(false)} onDrop={handleFileDrop} />}
        </section>

        <button className={style.submit} onClick={handleContinue}>Continue</button>
    </div>;
}

function ImageUploadStep2(props: { imageHref: string | undefined, source: File | string | undefined, reset: VoidFunction, advance: VoidFunction }) {
    const [isDraggingFile, setDraggingFile] = useState(false);
    const [link, setLink] = useState("");

    const router = useRouter();

    return <>
        <h2>Change avatar</h2>

        <img src={props.imageHref}></img>
        <button className={style.reset} onClick={props.reset}>Reset</button>
        <button className={style.submit} onClick={props.advance}>Continue</button>
    </>;
}

function ImageUploadStep3(props: { imageHref: string | undefined, source: File | string | undefined, reset: VoidFunction }) {
    const router = useRouter();

    function handleContinue() {
        const data = new FormData();
        data.append("file", props.source as File);

        api.post(`/v1/users/me/avatar`, data).then(() => router.reload()).catch(alert);
    }

    return <div className={style.confirmationScreen}>
        <img src={props.imageHref}></img>
        <h2>Are you sure?</h2>
        <p>Your current profile picture will<br />be permanently deleted.</p>

        <section className={style.confirmationButtons}>
            <button className={style.cancel} onClick={props.reset}>Cancel</button>
            <button className={style.proceed} onClick={handleContinue}>Proceed</button>
        </section>
    </div>;
}

function checkImage(src: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const image = new Image();
        image.onload = e => {
            if (image.width !== image.height) {
                reject('Image ratio must be 1:1!');
                return;
            }

            resolve(src);
        }
        image.onerror = reject;
        image.src = src;
    });
}