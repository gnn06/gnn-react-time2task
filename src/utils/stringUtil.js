export function insertItemInInput  (value, startP, endP, valueToInsert) {
    let   begin = value.substring(0, startP);
    const end   = value.substring(endP);
    const word  = wordBefore(value, startP);
    if (startP === endP && valueToInsert.indexOf(wordBefore(value, startP)) > -1) {
        // remove suggestion start
        begin = begin.replace(word, '');
    } 
    const result = insertSeparator(begin, end, valueToInsert);
    return result
}

export function insertSeparator(start, end, toInsert) {
    return start
    // start is not empty and ending by a space
    + (start !== '' && start.at(-1) !== ' ' ? ' ' : '')
    + toInsert
    + (end !== '' && end.at(0) !== ' ' ? ' ' : '')
    + end
}

export function wordBefore(str, pos) {
    const before = str.substring(0, pos);
    if (!before) return '';
    const result = before.match(/[a-zA-Z_]+$/)
    return result && result.length ? result[0] : '';
}

// sépare autour des blancs sauf quand " + 12"
export function tokenizer(expr) {
    return expr.trim().split(/\s+/)
}

// sépare autour des blancs sauf quand " + 12"
export function IDizer(expr) {
    return expr.trim().match(/\S+(\s+\+\s+\d+)?/g)
}

export function appendWithSpace(str1, str2) {
    return str1 + (str1 === "" ? "" : " ")  + str2
}