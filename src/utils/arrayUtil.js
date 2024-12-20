export function arrayPut(array, item) {
    const index = array.indexOf(item);
    if (index === -1) {
        array.push(item);
    } else {
        array.splice(index, 1);
    }
}

export function indexOfSiblingLevel(tab, start) {
    const firstLevel = tab[start];
    for (start++; start < tab.length; start++) {
        const itemLevel = tab[start];
        if (firstLevel >= itemLevel) {
            return start;
        }
    }
    return start;
}

/**
 * Check if array1 is inside array2
 * @param {*} array1 
 * @param {*} array2 
 * @returns 
 */
export function insideOrEqual(array1, array2) {
    for (let i = 0; i < array1.length; i++) {
        if (array1[i] !== array2[i]) {
            return false;
        }
    }
    return true;
}

/**
 * test if one array is inside stricly an other
 * [1, 2] inside [1, 2, 3], [1, 2] is not inside [1, 2]
 * @param {string[]} array1 
 * @param {string[]} array2 
 * @returns boolean
 */
export function insideStrict(array1, array2) {
    let equal = true
    for (let i = 0; i < array1.length && i < array2.length; i++) {
        if (array1[i] !== array2[i]) {
            equal = false
            break
        }
    }
    if (equal) {
        /* common part is equal, differ by length */
        if (array1.length === array2.length) {
            return false
        } else if (array1.length < array2.length) {
            return true
        } else if (array2.length < array1.length) {
            return false
        } else {
            return false
        }
    } else {
        /* differ by value */
        return false
    }
}

export function splitPredicate(input, predicateFn) {
    const result = []
    let temp = []
    for (let i = 0; i < input.length; i++) {
        const item = input[i];
        if (predicateFn(item) && temp.length > 0) {
            result.push(temp)
            temp = []
        }
        temp.push(item)
    }
    result.push(temp)
    return result
}