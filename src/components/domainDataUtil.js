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

/**
 * is a slot is inside an other
 * 'week lundi' is in 'week'
 * module private
 */
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

/*
 * firstSlot('week lundi') = 'week'
 */
export function firstSlot(slotExpr) {
    return slotExpr.split(' ')[0];
}

/*
 * slotDepth('this_month week lundi') = 3
 * @return int >= 1
 */
export function slotDepth(slotExpr) {
    return slotExpr.split(' ').length;
}

/*
 * lowerSlot('this_month week lundi') = 'week lundi'
 */
export function lowerSlot(slotExpr) {
    const i = slotExpr.indexOf(' ');
    if (i === -1)
        return '';
    else
        return slotExpr.substring(i + 1);
}

/**
 * completeSlot('lundi') = 'this_month week lundi'
 */
export function completeSlot(givenSlotExpr) {
    if (givenSlotExpr === undefined) return undefined;
    const first = firstSlot(givenSlotExpr);
    const level = getSlotLevel(first);
    if (level === 1)
        return givenSlotExpr;
    else if (level === 2)
        return getCurrentSlot(1) + ' ' + givenSlotExpr;
    else if (level === 3)
        return getCurrentSlot(1) + ' ' + getCurrentSlot(2) + ' ' + givenSlotExpr;
    else {
        return getCurrentSlot(1) + ' ' + getCurrentSlot(2) + ' ' + getCurrentSlot(3) + ' ' + givenSlotExpr;
    }
}

/*
 * returns the default slot of the given level
 * getCurrentSlot(1) = this_month
 * this_month, week, lundi, matin
 * level int between 1 this_month and 4 matin
 */
function getCurrentSlot(level) {
    if (level === 1)
        return 'this_month';
    else if (level === 2)
        return 'week';
    else if (level === 3)
        return 'lundi';
    else if (level === 4)
        return 'matin';
    else
        return '';
}

/**
 * give the level of a slot
 * @returns int -1 or between 1 and 4
 */
function getSlotLevel(slot) {
    if (slot === 'this_month')
        return 1;
    if (slot === 'week' || slot === 'next_week')
        return 2;
    else if (slot === 'lundi' || slot === 'mardi' || slot === 'mercredi' || slot === 'jeudi' || slot === 'vendredi')
        return 3;
    else if (slot === 'matin' || slot === 'aprem')
        return 4;
    else
        return -1
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

/**
 * test is two path have the same path
 * @returns boolean
 */
export function slotEqual(slot, otherSlot) {
    if (slot !== undefined && otherSlot !== undefined) {
        const first = firstSlot(slot);
        const firstOther = firstSlot(otherSlot);
        if (first !== firstOther)
            return false;
        else {
            const lowerThis = lowerSlot(slot);
            const lowerOther = lowerSlot(otherSlot);
            if (lowerThis === '' && lowerOther === '')
                return true;
            else
                return slotEqual(lowerThis, lowerOther);
        }
    } else if (slot === undefined && otherSlot === undefined) {
        return true;
    } else {
        return false;
    }
}

