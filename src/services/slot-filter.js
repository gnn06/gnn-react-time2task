import { completeSlot, slotIsInOther, slotEqual } from './slot-path.js';
import { makeFilter }               from './filter-engine.js';

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
        return tasks.filter(task => slotEqual(completeSlot(task.slotExpr), slot.path));
    } else {
        return tasks.filter(task => slotIsInOther(completeSlot(task.slotExpr), slot.path));
    }
}

/**
 * unused
 */
export function filterNoSlot(tasks, association) {
    return tasks.filter(task => association[task.id] == null);
}

/*
 * unused
 */
export function findTaskWithSlot(tasks, slotId, association) {
    const assos = Object.entries(association).map(entry => entry[1] === slotId ? entry[0] : null);
    return tasks.filter(task => assos.indexOf(task.id) >= 0);
};

/**
 * unused
 */
export function slotMatchExpr(slotId, slotExpr) {
    const result = slotExpr !== undefined && slotExpr.indexOf(slotId) > -1;
    return result;
}

/*
 * unused
 */
export function setSlotPath(slot, parentPath) {
    const copy = {...slot};
    copy.path = (parentPath !== '' ? parentPath + ' ' : '') + slot.id;
    for (let i = 0; i < slot.inner.length; i++) {
        slot.inner[i] = setSlotPath(slot.inner[i], (parentPath !== '' ? parentPath + ' ' : '') + slot.id);
    }
    return copy;
}
