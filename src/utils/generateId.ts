const characters = 'abcdefghijklmnopqrstuv0123456789';

export function generateId() {
    const time = Date.now();
    return time.toString();
}