export type DateDifference = {
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export function formatDate(string: string | Date) {
    const date = string instanceof Date ? string as Date : new Date(string);
    const today = new Date();

    const diff = getDifference(date, today);

    if (isRecent(diff)) {
        // return 'Today';
        return diff.hours > 6 ? isToday(date) ? 'Today' : 'Yesterday' : diff.hours === 0 ? diff.minutes === 0 ? 'Just now' : `${diff.minutes}m ago` : `${diff.hours}h ago`;
    }

    if (diff.years === 0 && diff.months === 0 && diff.days < 30)
        return diff.days <= 1 ? 'Yesterday' : `${diff.days} days ago`;
    
    if (diff.years === 0 && diff.months === 1 && diff.days < 30)
        return '1 month ago';
    
    if (diff.years === 0)
        return diff.months + ' months ago';

    return date.toLocaleDateString();
}

export function isRecent(diff: DateDifference) {
    return diff.years === 0 && diff.months === 0 && diff.days === 0 && diff.hours < 6;
}

export function isToday(date: Date) {
    const today = new Date();
    return date.getDate() == today.getDate() && date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear();
}

export function isYesterday(date: Date) {
    const today = new Date(date);
    today.setTime(today.getTime() - 86400000);

    return isToday(today);
}

export function isTomorrow(date: Date) {
    const today = new Date(date);
    today.setTime(today.getTime() + 86400000);

    return isToday(today);
}

export function getDifference(start: Date, end: Date): DateDifference {
    let seconds = (end.getTime() - start.getTime()) / 1000;
    let minutes = seconds / 60;
    seconds = seconds % 60;

    let hours = minutes / 60;
    minutes = minutes % 60;

    let days = hours / 24;
    hours = hours % 24;

    let months = days / 30;
    days = days % 30;

    let years = months / 12;
    months = months % 12;

    return {
        years: parseInt(years.toFixed()),
        months: parseInt(months.toFixed()),
        days: parseInt(days.toFixed()),
        hours: parseInt(hours.toFixed()),
        minutes: parseInt(minutes.toFixed()),
        seconds: parseInt(seconds.toFixed())
    }
}