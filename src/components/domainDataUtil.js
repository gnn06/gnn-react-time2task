import { slotIsInOther, completeSlot, slotEqual } from '../services/slot.js';

/**
 * unused
 */
export function filterNoSlot(tasks, association) {
    return tasks.filter(task => association[task.id] == null);
}

/**
 * filter a task list on a filter expression
 */
export function filterSlotExpr(tasks, filter) {
    if (filter === 'no-filter') return tasks;
    const filterComplet = completeSlot(filter);
    return tasks.filter(item => slotIsInOther(completeSlot(item.slotExpr), filterComplet));
}

/*
 * unused
 */
export function findTaskWithSlot(tasks, slotId, association) {
    const assos = Object.entries(association).map(entry => entry[1] === slotId ? entry[0] : null);
    return tasks.filter(task => assos.indexOf(task.id) >= 0);
};

/**
 * filter the task list included in a slot. used by slot view.
 * @param {*} tasks 
 * @param {*} slot with a path
 * @returns [tasks filtered]
 */
export function findTaskBySlotExpr(tasks, slot) {
    if (slot.inner !== undefined && slot.inner.length !== 0) {
        return tasks.filter(task => slotEqual(completeSlot(task.slotExpr), slot.path));
    } else {
        return tasks.filter(task => slotIsInOther(completeSlot(task.slotExpr), slot.path));
    }
}

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
