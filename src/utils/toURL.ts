export function toURL(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => {
            resolve(event.target?.result as string);
        };
        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}