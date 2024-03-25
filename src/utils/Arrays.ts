export namespace Arrays {
    export function setValuePresent<T>(array: T[], value: T, present: boolean) {
        const clone = [...array];
        if (present) {
            clone.push(value);
        } else {
            const indexOf = clone.indexOf(value);
            clone.splice(indexOf, 1);
        }

        return clone;
    }

    export function pushIfAbsent<T>(array: T[], value: T, predicate: (entry: T) => boolean) {
        for (const entry of array)
            if (predicate(entry))
                return;

        array.push(value);
    }

    export function pushAllIfAbsent<T>(array: T[], values: T[], comparator: (entry: T, value: T) => boolean) {
        outer: for (const value of values) {
            for (const entry of array) {
                if (comparator(entry, value)) {
                    continue outer;
                }
            }

            array.push(value);
        }
    }
}