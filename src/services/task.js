import { slotCompare, slotIsInOther, slotEqual } from "./slot-path";
import { makeFilter }  from './filter-engine.js';

export function taskFilter(task, filter) {
    return slotIsInOther(task.slotExpr, filter)
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
    return tasks.filter(makeFilter(filter));
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
        // TODO manage multi, actually match only the first slot
        return tasks.filter(task => slotEqual(task.slotExpr, slot.path));
    } else {
        return tasks.filter(task => slotIsInOther(task.slotExpr, slot.path));
    }
}
