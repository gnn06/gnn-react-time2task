import { slotCompare } from "./slot"

export function taskCompare(task1, task2) {
    const slotComp = slotCompare(task1.slotExpr, task2.slotExpr)
    if (slotComp === 0) {
        if (task1.order < task2.order)
            return -1
        else if (task1.order > task2.order)
            return 1
        else   
            return 0
    }
    return slotComp
}