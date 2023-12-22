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
