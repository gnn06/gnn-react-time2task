import { taskPredicateEqualAndInclude, taskPredicateEqual, taskPredicateNoRepeat, taskPredicateEvery2 } from './task.js';

const makeSlotExprFilterFunc = (task, filter) => taskPredicateEqualAndInclude(task, filter);

const makeExactFilterFunc = (task, filter) => taskPredicateEqual(task, filter);

/* module private */
export const makeTitleFilterFunc = (task, title) => task.title.toLowerCase().indexOf(title.toLowerCase()) >= 0;

/* export for test */
export const makeNoRepeatFilterFunc = (task) => taskPredicateNoRepeat(task)

export const makeEvery2FilterFunc = (task) => taskPredicateEvery2(task)


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
    } else if (filterExpr === 'NOREPEAT') {
        return makeNoRepeatFilterFunc;
    } else if (filterExpr === 'EVERY2') {
        return makeEvery2FilterFunc;    
    } else {
        if (filterExpr.endsWith(' NONE')) {
            return (task) => makeExactFilterFunc(task, filterExpr.slice(0, -5));
        } else {
            return (task) => makeSlotExprFilterFunc(task, filterExpr);
        }
    }
}

export const FILTER_KEYWORDS = ['NONE', 'title:', 'NOREPEAT', 'EVERY2', 'AND', 'OR'];