import { Parser } from './parser'
import { slotIsInOtherBranch, isSlotRepeat1Branch, isSlotRepeat2Branch, slotCompareBranch, isSlotSimpleBranch, isSlotUniqueBranch } from './slot-branch'

/**
 * give the level of a slot
 * @returns int -1 or between 1 and 4
 * public used by parser.js
 */
export function getSlotLevel(slot) {
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

export const weight = {
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

export const slotIdList = ['this_month', 'next_month', 'this_week', 'next_week', 'following_week', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'matin', 'aprem'];

export const slotKeyWords = [
    'disable', 'chaque', 'EVERY2'
];

export function getExprKeywords() {
    return slotIdList.concat(slotKeyWords)
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

/**
 * 
 * @param { mono or multi complete slotPath} obj1 obj2. if a multi slot is given, compare on first slot
 * @returns 
 * public, used by apiSlice.js, task.js
 */
export function slotCompare(obj1, obj2) {
    const parser = new Parser()
    const tree1 = parser.parse(obj1)
    const tree2 = parser.parse(obj2)
    return slotCompareBranch(tree1, tree2)
}

/**
 * test is two path have the same path
 * @param slot complete slotPath
 * @returns boolean
 * public used by slot-filter.js and filter-engine.js
 */
export function slotEqual(slot, otherSlot) {
    const temp = slotCompare(slot, otherSlot)
    return temp === 0;
}

/**
 * is a slot is inside an other
 * 'week lundi' is in 'week'
 * module private
 * @param mono complete slot. if Given multi, test on first slot
 * public used by filter-engine.js, solt-filter.js, task.js
 */
export function slotIsInOther(slotExpr, otherSlotExpr) {
    const parser = new Parser()
    const tree1 = parser.parse(slotExpr)
    const tree2 = parser.parse(otherSlotExpr)
    return slotIsInOtherBranch(tree1, tree2)
}

export function isSlotUnique(slotExpr) {
    const parser = new Parser()
    const tree = parser.parse(slotExpr)
    return isSlotUniqueBranch(tree)
}

export function isSlotRepeat1(slotExpr) {
    const parser = new Parser()
    const tree = parser.parse(slotExpr)
    return isSlotRepeat1Branch(tree)
}

export function isSlotRepeat2(slotExpr) {
    const parser = new Parser()
    const tree = parser.parse(slotExpr)
    return isSlotRepeat2Branch(tree)
}

/* check if only branch and no multi */
export function isSlotSimple(slotExpr) {
    const parser = new Parser()
    const tree = parser.parse(slotExpr)
    return isSlotSimpleBranch(tree)
}