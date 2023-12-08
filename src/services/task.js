import { slotCompare, completeSlot, multi2Mono } from "./slot"

export function taskCompare(task1, task2) {
    // if multi slot, compare on the first one
    const slotComp = slotCompare(completeSlot(multi2Mono(task1.slotExpr)[0]), completeSlot(multi2Mono(task2.slotExpr)[0]))
    if (slotComp === 0) {
        // put no order task at begin
        const order1 = task1.order == undefined ? 0 : task1.order
        const order2 = task2.order == undefined ? 0 : task2.order
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