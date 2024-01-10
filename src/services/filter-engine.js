import { multiSlotIsInOther, completeMultiSlot, multi2Mono } from './slot.js';
import { completeSlot } from './slot-path.js';

const makeSlotExprFilterFunc = (task, filter) => multiSlotIsInOther(completeMultiSlot(multi2Mono(task.slotExpr)), completeSlot(filter));

/* module private */
export const makeTitleFilterFunc = (task, title) => task.title.indexOf(title) >= 0;

/* public, used slot-filter.js by */
export function makeFilter(filterExpr) {
    if (filterExpr === '' || filterExpr === 'no-filter') return () => true;
    const filtersAnd = filterExpr.split(' AND ');
    if (filtersAnd.length >= 2) {
        return (task) => filtersAnd.every(filter => makeFilter(filter)(task));
    }
    const filtersOr = filterExpr.split(' OR ');
    if (filtersOr.length >= 2) {
        return (task) => filtersOr.some(filter => makeFilter(filter)(task));
    }
    if (filterExpr.startsWith('title:')) {
        const title = filterExpr.replace('title:', '')
        return (task) => makeTitleFilterFunc(task, title);
    } else {
        return (task) => makeSlotExprFilterFunc(task, filterExpr);
    }
}