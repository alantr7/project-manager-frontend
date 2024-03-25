export function conditional<T1, T2>(condition: boolean | (() => any) | any, var1: T1, defaultVal?: T2): T1 | T2 | undefined {
    const conditionResult = typeof condition === 'boolean'
        ? condition === true
        : typeof condition === 'function'
            ? condition()
            : condition !== undefined;

    return (typeof conditionResult === 'boolean'
        ? conditionResult === true
        : conditionResult !== undefined) ? var1 : defaultVal;
}