import { taskPredicateEqualAndInclude, taskPredicateEqual, taskPredicateNoRepeat, taskPredicateEvery2, taskPredicateEvery1, taskPredicateMulti, taskPredicateDisable, taskPredicateStatus, taskPredicateError, taskPredicateId } from './task.js';
import { isSlotSimple } from './slot-expr.js';
import { composeFuncAnd } from '../utils/predicateUtil.js';
import { getSlotIdAndKeywords } from './slot-id.js';
import { tokenizer } from '../utils/stringUtil.js';

const makeSlotExprFilterFunc = (task, filter) => taskPredicateEqualAndInclude(task, filter);

const makeExactFilterFunc = (task, filter) => taskPredicateEqual(task, filter);

/* module private */
export const makeTitleFilterFunc = (task, title) => task.title.toLowerCase().indexOf(title.toLowerCase()) >= 0;

/* export for test */
export const makeNoRepeatFilterFunc = (task) => taskPredicateNoRepeat(task)

export const makeEvery1FilterFunc = (task) => taskPredicateEvery1(task)

export const makeEvery2FilterFunc = (task) => taskPredicateEvery2(task)

export const makeIsMultiFilterFunc = (task) => taskPredicateMulti(task)

export const makeIsDisableFilterFunc = (task) => taskPredicateDisable(task)

export const makeStatusFilterFunc = (task, status) => taskPredicateStatus(task, status)

export const makeErrorFilterFunc = (task) => taskPredicateError(task)

/**
 * return { func: (task) => boolean, error: string}
 */
export function makeFilterCombine(filter) {
    const filters = []
    const expression = filter.expression === '' ? null : filter.expression
    if (expression) {
        filters.push(makeFilterExpr(expression).func)
    }
    if (filter.isMulti) {
        filters.push(taskPredicateMulti)
    }
    if (filter.isDisable) {
        filters.push(taskPredicateDisable)
    }
    if (filter.isStatusARepo) {
        filters.push((task) => makeStatusFilterFunc(task, "fait-à repositionner"))
    }
    if (filter.isError) {
        filters.push(makeErrorFilterFunc)
    }
    if (filter.slot) {
        filters.push(makeFilterExpr(filter.slot).func)
    }
    if (filter.taskId) {
        filters.push((task) => task.id === Number.parseInt(filter.taskId))
    }

    return { func: composeFuncAnd(filters) }
}

/**
 * return { func: (task) => boolean, error: string}
 */
export function makeFilterMulti(filterMulti) {
    if (filterMulti) {
        return {func: (task) => makeIsMultiFilterFunc(task)};
    } else {
        return {func: () => true};
    }
}

/* public, used slot-filter.js by */
/**
 * return { func: (task) => boolean, error: string}
 */
export function makeFilterExpr(filterExpr) {
    if (filterExpr === '') return {func: () => true};
    const filtersAnd = filterExpr.split(' AND ');
    if (filtersAnd.length >= 2) {
        return {func: (task) => filtersAnd.every(filter => makeFilterExpr(filter).func(task))};
    }
    const filtersOr = filterExpr.split(' OR ');
    if (filtersOr.length >= 2) {
        return {func: (task) => filtersOr.some(filter => makeFilterExpr(filter).func(task))};
    }
    if (filterExpr.startsWith('title:')) {
        const title = filterExpr.replace('title:', '')
        return {func: (task) => makeTitleFilterFunc(task, title)};
    } else if (filterExpr.startsWith('status:')) {
        const status = filterExpr.replace('status:', '')
        return {func: (task) => makeStatusFilterFunc(task, status)};
    } else if (filterExpr === 'NOREPEAT') {
        return {func: makeNoRepeatFilterFunc};
    } else if (filterExpr === 'EVERY1') {
        return {func: makeEvery1FilterFunc};
    } else if (filterExpr === 'EVERY2+') {
        return {func: makeEvery2FilterFunc};
    } else if (filterExpr.startsWith('id:')) {
        const id = filterExpr.replace('id:', '')
        return {func: (task) => task.id === Number.parseInt(id)};
    } else if (filterExpr === 'ERROR') {
        return {func: makeErrorFilterFunc};
    } else {
        const iDs = tokenizer(filterExpr)
        const firstID = iDs[0]
        const isExpr = getSlotIdAndKeywords().indexOf(firstID) > -1
        if (isExpr) {
            if (!isSlotSimple(filterExpr)) return {error:'filter error', func:() => true};
            if (filterExpr.endsWith(' NONE')) {
                return {func: (task) => makeExactFilterFunc(task, filterExpr.slice(0, -5))};
            } else {
                return {func: (task) => makeSlotExprFilterFunc(task, filterExpr)};
            }
        } else {
            // title
            const title = filterExpr.replace('title:', '')
            return {func: (task) => makeTitleFilterFunc(task, title)};
        }
    }
}

export const FILTER_KEYWORDS = ['NONE', 'title:', 'NOREPEAT', 'EVERY1', 'EVERY2+', 'status:', 'id:', 'ERROR', 'AND', 'OR'];