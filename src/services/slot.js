import { indexOfSiblingLevel } from "../utils/arrayUtil";
/**
 * test is two path have the same path
 * @param slot complete slotPath
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
    if (slot === 'this_month' || slot === 'next_month')
        return 1;
    if (slot === 'week' || slot === 'next_week' || slot === 'following_week' || slot === 'this_week')
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
export function getCurrentSlot(level) {
    if (level === 1)
        return 'this_month';
    else if (level === 2)
        return 'this_week';
    else if (level === 3) {
        const currentTime = new Date();
        const day = currentTime.getDay(); // 0 = dimanche
        const jour = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        return jour[day];
    }
    else if (level === 4)
        return 'matin';
    else
        return '';
}

export function getCurrentPath() {
    return getCurrentSlot(1) + ' ' + getCurrentSlot(2) + ' ' + getCurrentSlot(3);
}

/**
 * completeSlot('lundi') = 'this_month week lundi'
 * @param {incomplete mono or multi slot} givenSlotExpr if multi slot is given, complete only the first slot
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
 * return 'week' => ''
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

function removeLastSlot(slotExpr) {
    const slots = slotExpr.split(' ');
    slots.pop();
    return slots.join(' ');
}

/**
 * is a slot is inside an other
 * 'week lundi' is in 'week'
 * module private
 * @param mono complete slot. if Given multi, test on first slot
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

export function multiSlotIsInOther(slotPathArray, otherSlotExpr) {
    return slotPathArray.some(item => slotIsInOther(item, otherSlotExpr))
}

const weight = {
    this_month: 1,
    next_month: 2,
    week      : 1,
    this_week : 2,
    next_week : 3,
    following_week: 4,
    lundi     : 1,
    mardi     : 2,
    mercredi  : 3,
    jeudi     : 4,
    vendredi  : 5,
    matin     : 1,
    aprem     : 2
}

/**
 * 
 * @param { mono or multi complete slotPath} obj1 obj2. if a multi slot is given, compare on first slot
 * @returns 
 */
export function slotCompare(obj1, obj2) {
    if (obj2 === undefined)
        return -1
    else if (obj1 === undefined)
        return 1
    const first1 = firstSlot(obj1);
    const first2 = firstSlot(obj2);
    const weight1 = weight[first1];
    const weight2 = weight[first2];
    if (weight1 < weight2)
        return -1
    else if (weight1 > weight2)
        return 1
    else {
        const lower1 = lowerSlot(obj1)
        const lower2 = lowerSlot(obj2)
        if (lower1 === '' && lower2 === '')
            return 0
        if (lower1 !== '' && lower2 !== '') 
            return slotCompare(lower1, lower2)
        else
            return 1
    }
}

/**
 * 
 * @param {multi incomplete slot} slotExpr. if undefined returns []
 * @returns [mono incomplete slot]
 */
export function multi2Mono(slotExpr) {
    if (slotExpr === undefined) return []
    let result = slotExpr.split(' ').filter(item => item !== 'chaque');
    result = removeDisable(result)
    result = result.reduce((acc, val) => {
        if (acc.length === 0) {
            acc.push(val);            
        } else if (getSlotLevel(acc.at(-1).split(' ').at(-1)) === getSlotLevel(val)) {
            const previous = removeLastSlot(acc.at(-1));
            acc.push((previous !== '' ? previous  + ' ' : '') + val);
        } else if (getSlotLevel(acc.at(-1).split(' ').at(-1)) > getSlotLevel(val)) {
            acc.push(val);
        } else {
            acc[acc.length-1] = acc.at(-1) + ' ' + val;
        }
        return acc;
    }, [])
    return result;
}

export function completeMultiSlot(incompleteMonoSlotArray) {
    return incompleteMonoSlotArray.map(completeSlot);
}

export function removeDisable(slotLst) {
    const levelLst = slotLst.map(getSlotLevel);
    let start;
    while ((start = slotLst.indexOf('disable')) >= 0) {
        if (start >= 0) {
            start++;
            const end = indexOfSiblingLevel(levelLst, start);
            slotLst.splice(start -1, end - start + 1)
            levelLst.splice(start -1, end - start + 1)
        }
    }
    return slotLst;
}

export const slotIdList = ['this_month', 'next_month', 'this_week', 'next_week', 'following_week', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'matin', 'aprem'];
