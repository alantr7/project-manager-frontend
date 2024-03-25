type UPLOAD_STATE = "INITIATED" | "SUCCESS" | "PROGRESS" | "FAILED";

export interface FileUpload {
    id?: string,
    tempId?: number,
    name: string,
    size: number,
    binary?: File,
    url?: string,
    isUploaded: boolean,
    state?: UPLOAD_STATE;
};