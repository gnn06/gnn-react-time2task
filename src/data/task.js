import { slotCompare, slotIsInOther, slotEqual, isSlotRepeat1, isSlotRepeat2 } from "./slot-path";
import { slotTruncateBranch, getHashBranch, completeSlotBranch } from "./slot-branch";
import { makeFilter }  from './filter-engine.js';
import { Parser } from "./parser";
import _ from 'lodash';

export function taskPredicateEqualAndInclude(task, filter) {
    return slotIsInOther(task.slotExpr, filter)
}

export function taskPredicateEqual(task, filter) {
    return slotEqual(task.slotExpr, filter)
}

export function taskPredicateNoRepeat(task) {
    return !isSlotRepeat1(task.slotExpr);
}

export function taskPredicateEvery2(task) {
    return isSlotRepeat2(task.slotExpr);
}

/* public, used by apiSlice.js */
export function taskCompare(task1, task2) {
    // if multi slot, compare on the first one
    const slotComp = slotCompare(task1.slotExpr, task2.slotExpr)
    if (slotComp === 0) {
        // put no order task at begin
        const order1 = task1.order === undefined ? 0 : task1.order
        const order2 = task2.order === undefined ? 0 : task2.order
        if (order1 < order2) {
            return -1
        } else if (order1 > order2) {
            return 1
        } else {
            return 0
        }
    }
    return slotComp
}

/**
 * filter a task list on a filter expression
 * @param {string} filter expression. (mono incomplet slotPath) with OR
 * public, used by slot.jsx and tasklist.jsx
 */
export function filterSlotExpr(tasks, filter) {
    if (filter === 'no-filter') return tasks;
    return tasks.filter(makeFilter(filter).func);
}

/**
 * filter the task list included in a slot. used by slot view.
 * @param {*} tasks 
 * @param {*} slot with a path
 * @returns [tasks filtered]
 * public, used by slot.jsx 
 */
export function findTaskBySlotExpr(tasks, slot) {
    if (slot.inner !== undefined && slot.inner.length !== 0) {
        return tasks.filter(task => slotEqual(task.slotExpr, slot.path));
    } else {
        return tasks.filter(task => slotIsInOther(task.slotExpr, slot.path));
    }
}

const parser = new Parser()

export function taskGroup(tasks, level) {
    const toto = _.groupBy(tasks, item => getHashBranch(slotTruncateBranch(completeSlotBranch(parser.parse(item.slotExpr)), level)))
    return toto;
}