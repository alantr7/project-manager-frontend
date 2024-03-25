export function repeat(cb: () => void, times: number, delay: number = 0, interval: number = 0) {
    /*if (delay === 0 && interval === 0) {
        for (let i = 0; i < times; i++) {
            cb();
        }
    } else {
        let counter = 0;
        setTimeout(() => {
            let intervalId = setInterval(() => {
                cb();

                counter++;
                if (counter === times)
                    clearInterval(intervalId);
            }, delay);
        }, delay);
    }*/

    repeatUsing(null, cb, times, 0, 0);
}

export function repeatUsing<T>(object: T, cb: (object: T) => void, times: number, delay: number = 0, interval: number = 0): T {
    if (delay === 0 && interval === 0) {
        for (let i = 0; i < times; i++) {
            cb(object);
        }
    } else {
        let counter = 0;
        setTimeout(() => {
            let intervalId = setInterval(() => {
                cb(object);

                counter++;
                if (counter === times)
                    clearInterval(intervalId);
            }, interval);
        }, delay);
    }

    return object;
}