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
 * lowerSlot('this_month week lundi') = 'week lundi'
 */
export function lowerSlot(slotExpr) {
    const i = slotExpr.indexOf(' ');
    if (i === -1)
        return '';
    else
        return slotExpr.substring(i + 1);
}

/*
 * slotDepth('this_month week lundi') = 3
 * @return int >= 1
 */
export function slotDepth(slotExpr) {
    return slotExpr.split(' ').length;
}

/*
 * firstSlot('week lundi') = 'week'
 */
export function firstSlot(slotExpr) {
    return slotExpr.split(' ')[0];
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

