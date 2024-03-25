export function createURL(url: string, params: { [key: string]: any | undefined }) {
    const array = Object.keys(params)
        .filter(key => {
            if (typeof params[key] === 'string' && params[key].trim().length === 0) {
                return false;
            }
            return params[key] !== undefined;
        })
        .map(key => `${key}=${params[key]}`);

    console.log(array);

    return array.length === 0 ? url : `${url}?${array.join('&')}`
}