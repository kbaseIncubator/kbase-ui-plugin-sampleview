interface SimpleObject {
    [k: string]: any;
}

export function arraysEquivalent(a: Array<any>, b: Array<any>): boolean {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i += 1) {
        const aValue = a[i];
        const bValue = b[i];
        if (typeof aValue !== typeof bValue) {
            return false;
        }
        if (typeof aValue !== 'object') {
            if (aValue !== bValue) {
                return false;
            }
        } else {
            if (isSimpleObject(aValue) && isSimpleObject(bValue)) {
                return objectsEquivalent(aValue, bValue);
            } else {
                return aValue === bValue;
            }
        }
    }
    return true;
}

export function isSimpleObject(value: any): value is SimpleObject {
    if (typeof value !== 'object') {
        return false;
    }
    if (value === null) {
        return false;
    }
    return (value.constructor === {}.constructor);
}

export function objectsEquivalent(a: SimpleObject, b: SimpleObject): boolean {
    const ak = Object.keys(a).sort();
    const bk = Object.keys(b).sort();
    if (!arraysEquivalent(ak, bk)) {
        return false;
    }
    const aValues = ak.map((k) => {
        return a[k];
    });
    const bValues = bk.map((k) => {
        return b[k];
    });
    return arraysEquivalent(aValues, bValues);
}