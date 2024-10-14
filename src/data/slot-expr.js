import { Parser } from './parser'
import { branchComplete, isBranchRepeat1, isBranchRepeat2, isBranchSimple, isBranchUnique, isBranchMulti } from './slot-branch'
import { branchCompare, isBranchEqualDeep, isBranchEqualOrInclude } from './slot-branch++'

/* check if only branch and no multi, used in filter */
export function isSlotSimple(slotExpr) {
    try {
        const parser = new Parser()
        const tree = parser.parse(slotExpr)
        return isBranchSimple(tree)
    } catch (error) {
        console.error(error, 'caused by ', slotExpr)
        return false;
    }
}

export function isSlotRepeat2(slotExpr) {
    try {
        const parser = new Parser()
        const tree = parser.parse(slotExpr)
        return isBranchRepeat2(tree)
    } catch (error) {
        console.error(error, 'caused by ', slotExpr)
        return false;
    }
}

export function isSlotRepeat1(slotExpr) {
    try {
        const parser = new Parser()
        const tree = parser.parse(slotExpr)
        return tree !== undefined ? isBranchRepeat1(tree) : false
    } catch (error) {
        console.error(error, 'caused by ', slotExpr)
        return false;
    }
}

export function isSlotUnique(slotExpr) {
    try {
        const parser = new Parser()
        const tree = parser.parse(slotExpr)
        return tree !== undefined ? isBranchUnique(tree) : false
    } catch (error) {
        console.error(error, 'caused by ', slotExpr)
        return false;
    }
}

export function isSlotMulti(slotExpr) {
    try {
        const parser = new Parser()
        const tree = parser.parse(slotExpr)
        return tree !== undefined ? isBranchMulti(tree) : false
    } catch (error) {
        console.error(error, 'caused by ', slotExpr)
        return false;
    }
}

/**
 * 
 * @param { mono or multi complete slotPath} obj1 obj2. if a multi slot is given, compare on first slot
 * @returns 
 * public, used by task sorting
 */
export function slotCompare(slotExpr1, slotExpr2) {
    const parser = new Parser()
    const tree1 = branchComplete(parser.parse(slotExpr1))
    const tree2 = branchComplete(parser.parse(slotExpr2))
    return branchCompare(tree1, tree2)
}

/**
 * test is two path have the same path.
 * differs from slotIsInOther slotEqual('this_week lundi', 'this_week') = false)
 * @param slotExpr complete slotPath
 * @returns boolean
 * public used by filtering with NONE, slotView on not terminal node (findTaskBySlotExpr)
 */
export function isSlotEqual(slotExpr, otherSlotExpr) {
    const parser = new Parser()
    const tree1 = branchComplete(parser.parse(slotExpr))
    const tree2 = branchComplete(parser.parse(otherSlotExpr))
    return isBranchEqualDeep(tree1, tree2)
}

/**
 * is a slot is inside an other
 * 'week lundi' is in 'week'
 * differs from slotEqual (slotIsInOther('this_week lundi', 'this_week') = true)
 * module private
 * @param mono complete slot. if Given multi, test on first slot
 * public used by filtering (except with NONE), slotview on terminal node (findTaskBySlotExpr)
 */
export function isSlotEqualOrInclude(slotExpr, otherSlotExpr) {
    const parser = new Parser()
    const tree1 = branchComplete(parser.parse(slotExpr))
    const tree2 = branchComplete(parser.parse(otherSlotExpr))
    return isBranchEqualOrInclude(tree1, tree2)
}