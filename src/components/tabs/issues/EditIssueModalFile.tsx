import { Issue } from "@/types/Issue";
import style from '../issues/EditIssueModal.module.scss';
import ReactModal from "react-modal";
import React, { FocusEvent, KeyboardEvent, MouseEvent, SyntheticEvent, useContext, useEffect, useRef, useState } from "react";
import { api } from "@/pages/_app";
import axios from "axios";
import { toast } from "react-toastify";
import { ProjectContext } from "@/layouts/ProjectLayout";
import Image from "next/image";
import { Label } from "@/types/Label";
import { formatDate } from "@/utils/formatDate";
import { AppContext } from "@/contexts/ProjectsContext";
import useAutosizedTextArea from "@/hooks/useAutosizedTextarea";
import { useFocus } from "@/hooks/useFocus";
import { FileUpload } from "@/types/FileUpload";
import { FullscreenImageContext } from "@/components/modals/FullscreenImageModal";
import Swal from "sweetalert2";
import { download } from "@/utils/download";

export function EditIssueModalFile({ data, completeUpload, removeAttachment }: { data: FileUpload, completeUpload(data: FileUpload): void, removeAttachment(id: string): void }) {
    const project = useContext(ProjectContext);
    const fullscreenImageContext = useContext(FullscreenImageContext);
    const [progress, setProgress] = useState(0);
    const [isUploading, setUploading] = useState(false);

    useEffect(() => {
        if (data.isUploaded || isUploading)
            return;

        setUploading(true);

        const fd = new FormData();
        fd.append('name', data.name);
        fd.append('file', data.binary as File);

        api.post(`/v1/projects/${project.project.id}/files`, fd, {
            onUploadProgress(ev) {
                const progress = (ev.progress as number) * 100;
                setProgress(Math.round(progress));
            },
        }).then(r => {
            completeUpload({
                ...data,
                isUploaded: true,
                id: r.data.id,
                url: r.data.url
            });
            setUploading(false);
        });
    }, []);

    function previewImage() {
        fullscreenImageContext.show(`${data.url}/preview`);
    }

    function handleDownload(e: SyntheticEvent) {
        e.stopPropagation();
        download(`${data.url}/download` as string, data.name);
    }

    function handleDelete(ev: SyntheticEvent) {
        ev.stopPropagation();

        Swal.fire({
            title: 'The attachment will be deleted.',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                api.delete(`/v1/projects/${project.project.id}/files/${data.id}`)
                    .then(r => {
                        removeAttachment(data.id as string);
                    })
                    .catch(() => alert('Couldn\'t...'));
            }
        });


    }

    return <div className={style.item} onClick={previewImage}>
        {isUploading && <div className={style.uploading}>
            {progress}%
        </div>}

        <div className={style.actionButtons}>
            <button className={style.downloadItem} onClick={handleDownload}></button>
            <button className={style.removeItem} onClick={handleDelete}></button>
        </div>
        {!isUploading && <FileRender {...data} />}
    </div>;
}

function FileRender(props: FileUpload) {
    if (props.binary?.type.startsWith("image") || props.name.endsWith('.PNG') || props.name.endsWith('.png')) {
        return <div className={style.image} style={{ backgroundImage: `url(${props.url}/preview)` }} />
    }
    return <div className={style.file}>
        <p className={style.name}>{props.name}</p>
    </div>
}