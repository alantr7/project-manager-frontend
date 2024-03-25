export function browseFiles(): Promise<FileList> {
    return new Promise<FileList>((resolve, reject) => {
        const input = document.createElement('input');
        input.type = "file";

        input.onchange = event => {
            const files = (event.target as HTMLInputElement).files;
            resolve(files !== null ? files : new FileList());
        }

        input.oncancel = () => resolve(new FileList());
        input.onabort = () => resolve(new FileList());
        input.onerror = reject;

        input.click();
    });
}