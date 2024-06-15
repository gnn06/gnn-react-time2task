export const weight = {
    month     : 1,
    this_month: 1,
    next_month: 2,
    week      : 1,
    this_week : 2,
    next_week : 3,
    following_week: 4,
    day       : 1,
    lundi     : 1,
    mardi     : 2,
    mercredi  : 3,
    jeudi     : 4,
    vendredi  : 5,
    matin     : 1,
    aprem     : 2
}

export const EXPR_KEYWORDS = [
    'disable', 'chaque', 'every'
];

export const SLOTIDS_LST = ['month', 'this_month', 'next_month', 'week', 'this_week', 'next_week', 'following_week', 'day', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'matin', 'aprem'];

const SLOTIDS_BY_LEVEL = {
    '1': ['this_month', 'next_month'],
    '2': ['this_week', 'next_week', 'following_week'],
    '3': ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
    '4': ['matin', 'aprem']
}

const GENERIC_SLOTIDS = [ 'month', 'week', 'day' ]

export function getSlotIdAndKeywords() {
    return SLOTIDS_LST.concat(EXPR_KEYWORDS)
}

/**
 * give the level of a slot
 * @returns int -1 or between 1 and 4
 * public used by parser.js
 */
export function getSlotIdLevel(slotId) {
    if (slotId === 'month' || slotId === 'this_month' || slotId === 'next_month')
        return 1;
    if (slotId === 'week' || slotId === 'next_week' || slotId === 'following_week' || slotId === 'this_week')
        return 2;
    else if (slotId === 'day' || slotId === 'lundi' || slotId === 'mardi' || slotId === 'mercredi' || slotId === 'jeudi' || slotId === 'vendredi')
        return 3;
    else if (slotId === 'matin' || slotId === 'aprem')
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
export function getSlotIdCurrent(level) {
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

export function getSlotIdFirstLevel(level) {
    const slots = SLOTIDS_BY_LEVEL[level.toString()]
    return slots[0]
}
 
export function getSlotIdPrevious(slotId, repetition) {
    if (isSlotIdGeneric(slotId)) {
        return slotId
    }
    const level = getSlotIdLevel(slotId)
    const slots = SLOTIDS_BY_LEVEL[level.toString()]
    const index = slots.indexOf(slotId)
    if (index === 0 && repetition === undefined) {
        return slotId
    }
    if (index === 0 && repetition === slots.length - 1) {
        return slots[slots.length - 1];
    }
    if (index === 0 && repetition > slots.length - 1) {
        return null
    }
    else {
        return slots[index - 1]
    }
}

export function isSlotIdGeneric(slotId) {
    return GENERIC_SLOTIDS.indexOf(slotId) > -1   
}