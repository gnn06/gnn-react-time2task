export function insertSeparator(start, end, toInsert) {
    return start + (start !== '' ? ' ' : '') + toInsert + (end !== '' ? ' ' : '') + end
}