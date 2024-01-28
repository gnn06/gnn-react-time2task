import { getCurrentPath, slotIsInOther, slotCompare, slotIsInOtherBranch, getCurrentPathBranch, getSlotLevel } from "./slot-path";
import { multi2Mono, completeMultiSlot, slotFilter } from './slot.js'

/* private module */
export function chooseSlotForSort (multi, todaySlot) {
    const hasToday = multi.find(slot => slotIsInOther(slot, todaySlot));
    if (hasToday) {
        return hasToday
    } else {
        return multi[0];
    }
}

export function taskFilter(task, filter) {
    return slotFilter(task.slotExpr, filter)
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