import { indexOfSiblingLevel } from "../utils/arrayUtil";
import { slotIsInOther, completeSlot, getSlotLevel, removeLastSlot } from './slot-path.js';

/* public used by filter-engine.js, solt-filter.js */
export function multiSlotIsInOther(slotPathArray, otherSlotExpr) {
    return slotPathArray.some(item => slotIsInOther(item, otherSlotExpr))
}

/* private */
class SlotParser {
    slots = [];
    newSlot(slotId) {
        this.slots.push(slotId);
    }
    continueSlot(slotId) {
        this.slots[this.slots.length-1] = this.slots.at(-1) + ' ' + slotId;
    }
    newMultiSlot(slotId) {
        const previous = removeLastSlot(this.slots.at(-1));
        this.slots.push((previous !== '' ? previous  + ' ' : '') + slotId);
    }
    getLastSlotId() {
        return this.slots.at(-1).split(' ').at(-1);
    }
    parse(arg) {
        this.slots = [];
        return arg.reduce((acc, val) => {
            if (acc.slots.length === 0) {
                acc.newSlot(val);
            } else if (val === 'chaque' || val === 'disable') {
                if (getSlotLevel(acc.getLastSlotId()) !== -1) {
                    acc.newSlot(val);
                } else {
                    acc.continueSlot(val);
                }                
            } else if (getSlotLevel(acc.getLastSlotId()) !== -1 && getSlotLevel(acc.getLastSlotId()) === getSlotLevel(val)) {
                acc.newMultiSlot(val);
            } else if (getSlotLevel(acc.getLastSlotId()) !== -1 && getSlotLevel(acc.getLastSlotId()) > getSlotLevel(val)) {
                acc.newSlot(val);
            } else {
                acc.continueSlot(val)
            }
            return acc;
        }, this).slots;
    }
};

/**
 * 
 * @param {multi incomplete slot} slotExpr. if undefined returns []
 * @returns [mono incomplete slot]
 * public used by syntax-input.jsx, filter-engine.js, task.js
 */
export function multi2Mono(slotExpr) {
    if (slotExpr === undefined) return []
    let result = slotExpr.split(' ').filter(item => item !== 'chaque');
    result = removeDisable(result)
    result = new SlotParser().parse(result);
    return result;
}

/* unused */
export function multi2MonoKeep(slotExpr) {
    if (slotExpr === undefined) return []
    let result = slotExpr.split(' ');
    result = new SlotParser().parse(result);
    return result;
}

/* public used by filter-engine.js, solt-filter.js, task.js */
export function completeMultiSlot(incompleteMonoSlotArray) {
    return incompleteMonoSlotArray.map(completeSlot);
}

/* private */
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

