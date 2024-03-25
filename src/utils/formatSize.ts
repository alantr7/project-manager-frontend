export function formatSize(bytes: number, decimals: boolean = true): string {
    if (bytes < 512)
        return formatAndSuffix(bytes, decimals, 'B');

    const kb = bytes / 1024;
    if (kb < 1024)
        return formatAndSuffix(kb, decimals, 'KB');

    const mb = kb / 1024;
    if (mb < 1024)
        return formatAndSuffix(mb, decimals, 'MB');

    return bytes + 'b';
}

function formatAndSuffix(input: number, decimals: boolean, suffix: string): string {
    return `${decimals ? Math.floor(input * 100) / 100 : input}${suffix}`;
}