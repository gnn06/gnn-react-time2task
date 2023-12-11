export function insertSeparator(start, end, toInsert) {
    return start
    // start is not empty and ending by a space
    + (start !== '' && start.at(-1) != ' ' ? ' ' : '')
    + toInsert
    + (end !== '' && end.at(0) != ' ' ? ' ' : '')
    + end
}