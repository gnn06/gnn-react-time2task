export function filterNoSlot(tasks, association) {
    return tasks.filter(task => association[task.id] == null);
}

/**
 * filter a task list on a filter expression
 */
// OK
export function filterSlotExpr(tasks, filter) {
    if (filter === 'no-filter') return tasks;
    const filterComplet = completeSlot(filter);
    return tasks.filter(item => slotIsInOther(completeSlot(item.slotExpr), filterComplet));
}

export function findTaskWithSlot(tasks, slotId, association) {
    const assos = Object.entries(association).map(entry => entry[1] === slotId ? entry[0] : null);
    return tasks.filter(task => assos.indexOf(task.id) >= 0);
};

// KO
export function findTaskBySlotExpr(tasks, slotId) {
    return tasks.filter(task => slotIsInOther(task.slotExpr, slotId));
}

export function slotMatchExpr(slotId, slotExpr) {
    const result = slotExpr !== undefined && slotExpr.indexOf(slotId) > -1;
    return result;
}

export function slotIsInOther(slotExpr, otherSlotExpr) {
    if (slotExpr === undefined || otherSlotExpr === undefined) return false;
    const first = firstSlot(slotExpr)
    const firstOther = firstSlot(otherSlotExpr)
    // first level is different, no need to go next level
    if (first !== firstOther)
        return false;
    else {
        const lower = lowerSlot(slotExpr);
        const lowerOther = lowerSlot(otherSlotExpr);
        // other has no more level so previous level egality is enough
        if (lowerOther === '') 
            return true;
        else
            // need to check at next level
            return slotIsInOther(lower, lowerOther);   
    }
}

export function firstSlot(slotExpr) {
    return slotExpr.split(' ')[0];
}

export function lowerSlot(slotExpr) {
    const i = slotExpr.indexOf(' ');
    if (i === -1)
        return '';
    else
        return slotExpr.substring(i + 1);
}

export function completeSlot(givenSlotExpr) {
    if (givenSlotExpr === undefined) return undefined;
    const first = firstSlot(givenSlotExpr);
    const level = getSlotLevel(first);
    if (level === 1) {
        return givenSlotExpr;
    } else {
        const currentSlot = getCurrentSlot();
        return currentSlot + ' ' + givenSlotExpr;
    }
}

function getCurrentSlot() {
    return 'week'; 
}

/**
 * @returns int -1 or >= 1
 */
function getSlotLevel(slot) {
    if (slot === 'week' || slot === 'next_week') {
        return 1;
    } else {
        return -1
    }
}