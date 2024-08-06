import { taskPredicateEqualAndInclude, taskPredicateEqual, taskPredicateNoRepeat, taskPredicateEvery2, taskPredicateEvery1, taskPredicateMulti } from './task.js';
import { isSlotSimple } from './slot-expr.js';

const makeSlotExprFilterFunc = (task, filter) => taskPredicateEqualAndInclude(task, filter);

const makeExactFilterFunc = (task, filter) => taskPredicateEqual(task, filter);

/* module private */
export const makeTitleFilterFunc = (task, title) => task.title.toLowerCase().indexOf(title.toLowerCase()) >= 0;

/* export for test */
export const makeNoRepeatFilterFunc = (task) => taskPredicateNoRepeat(task)

export const makeEvery1FilterFunc = (task) => taskPredicateEvery1(task)

export const makeEvery2FilterFunc = (task) => taskPredicateEvery2(task)

export const makeIsMultiFilterFunc = (task) => taskPredicateMulti(task)


export function makeFilterCombine(filterExpr, filterIsMulti) {
    
    const filterExprFunc   = filterExpr    && makeFilter(filterExpr).func;
    const filterIsMultiFunc = filterIsMulti && makeIsMultiFilterFunc;
    if (filterExprFunc && filterIsMultiFunc) {
        return {func: (task) => filterExprFunc(task) && filterIsMultiFunc(task)}
    } else if (filterExprFunc) {
        return {func: filterExprFunc};
    } else if (filterIsMultiFunc) {
        return {func: filterIsMultiFunc};
    } else {
        return {func: () => true};
    }
}

export function makeFilterMulti(filterMulti) {
    if (filterMulti) {
        return {func: (task) => makeIsMultiFilterFunc(task)};
    } else {
        return {func: () => true};
    }
}

/* public, used slot-filter.js by */
export function makeFilter(filterExpr) {
    if (filterExpr === '' || filterExpr === 'no-filter') return {func: () => true};
    const filtersAnd = filterExpr.split(' AND ');
    if (filtersAnd.length >= 2) {
        return {func: (task) => filtersAnd.every(filter => makeFilter(filter).func(task))};
    }
    const filtersOr = filterExpr.split(' OR ');
    if (filtersOr.length >= 2) {
        return {func: (task) => filtersOr.some(filter => makeFilter(filter).func(task))};
    }
    if (filterExpr.startsWith('title:')) {
        const title = filterExpr.replace('title:', '')
        return {func: (task) => makeTitleFilterFunc(task, title)};
    } else if (filterExpr === 'NOREPEAT') {
        return {func: makeNoRepeatFilterFunc};
    } else if (filterExpr === 'EVERY1') {
        return {func: makeEvery1FilterFunc};
    } else if (filterExpr === 'EVERY2') {
        return {func: makeEvery2FilterFunc};
    } else {
        if (!isSlotSimple(filterExpr)) return {error:'filter error', func:() => true};
        if (filterExpr.endsWith(' NONE')) {
            return {func: (task) => makeExactFilterFunc(task, filterExpr.slice(0, -5))};
        } else {
            return {func: (task) => makeSlotExprFilterFunc(task, filterExpr)};
        }
    }
}

export const FILTER_KEYWORDS = ['NONE', 'title:', 'NOREPEAT', 'EVERY1', 'EVERY2', 'AND', 'OR'];