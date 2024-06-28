import { _chooseSlotForSortBranch, _getBranchPreviousOrShift, branchRemoveDisable, getBranchLowerSlot, 
          getBranchWeight, getBranchTail, isBranchEqualShallow } from "./slot-branch";
import { getSlotIdLevel, getSlotIdPrevious } from "./slot-id";

/**
 * differs from isBranchEqualOrInclude isBranchEqualDeep('this_week lundi', 'this_week') = false)
 * require params should be completed
 * param branch1 complete
 * param branch2 complete and mono
 * used by slotEqual
 * used by filtering with NONE, slotView on not terminal node (findTaskBySlotExpr)
 */
export function isBranchEqualDeep(branch1, branch2) {
    if (branch1.type === 'multi') {
        return branch1.value.some(branch => isBranchEqualDeep(branch, branch2))
    }
    if (branch1.value.length === 1 && branch2.value.length === 1) {
        return isBranchEqualShallow(branch1, branch2)
    } else if (branch1.value.length !== branch2.value.length) {
        return false
    } else {
        if (isBranchEqualShallow(branch1, branch2) === false) {
            return false
        } else {
            const tail1 = getBranchTail(branch1)
            const tail2 = getBranchTail(branch2)
            return isBranchEqualDeep(tail1, tail2)
        }
    }
}

/**
 * isBranchEqualOrInclude (this_week lundi, this_week) = true
 * if multi, true if some branch is in other
 * differs from isBranchEqual ; isBranchEqualOrInclude('this_week lundi', 'this_week') = true
 * require params should have same starting depth
 * used by filtering (except with NONE), slotview on terminal node (findTaskBySlotExpr)
 */
export function isBranchEqualOrInclude(branch1, branch2) {
    if (branch1 === undefined || branch2 === undefined) return false;
    if (branch2.type !== 'branch') {
        throw new Error('slotIsInOtherBranch param otherSlotExpr should not be multi');
    }
    branch1 = branchRemoveDisable(branch1)
    if (branch1 === null) return false;
    if (branch1.type === 'branch' && branch2.type === 'branch') {
        if (!isBranchEqualShallow(branch1, branch2))
            return false;
        else {
            const lower = getBranchLowerSlot(branch1);
            const lowerOther = getBranchLowerSlot(branch2);
            // other has no more level so previous level egality is enough
            if (lowerOther.value.length === 0) 
                return true;
            else
                // need to check at next level
                return isBranchEqualOrInclude(lower, lowerOther);   
        }
    } else if (branch1.type === 'multi' && branch2.type === 'branch') {
        return branch1.value.some(slot => isBranchEqualOrInclude(slot, branch2))
    }
}

/**
 * require params to be complete branch
 * @returns 
 */
export function branchCompare(branch1, branch2) {
    if (branch1 === undefined || (branch1.flags && branch1.flags.indexOf('disable') >= 0))
        return 1;
    if (branch2 === undefined || (branch2.flags && branch2.flags.indexOf('disable') >= 0))
        return -1;
    if (branch1.type === 'branch' && branch2.type === 'branch') {
        const weight1 = getBranchWeight(branch1);
        const weight2 = getBranchWeight(branch2);
        if (weight1 < weight2)
            return -1
        else if (weight1 > weight2)
            return 1
        else {
            const lower1 = getBranchLowerSlot(branch1)
            const lower2 = getBranchLowerSlot(branch2)
            if (lower1.value.length === 0 && lower2.value.length === 0)
                return 0
            if (lower1.value.length !== 0 && lower2.value.length !== 0) 
                return branchCompare(lower1, lower2)
            if (lower1.value.length !== 0 && lower2.value.length === 0) 
                return -1
            else
                return 1
        }
    } else if (branch1.type === 'multi' && branch2.type === 'branch') {
        return branchCompare(_chooseSlotForSortBranch(branch1), branch2)
    } else if (branch1.type === 'branch' && branch2.type === 'multi') {
        return branchCompare(branch1, _chooseSlotForSortBranch(branch2))
    } else if (branch1.type === 'multi' && branch2.type === 'multi') {
        return branchCompare(_chooseSlotForSortBranch(branch1), _chooseSlotForSortBranch(branch2))
    }

}

export function branchShift (branch, levelToShift) {
    if (typeof branch === 'string') {
        if (getSlotIdLevel(branch) === getSlotIdLevel(levelToShift)) {
            return getSlotIdPrevious(branch, branch.repetition)
        } else {
            return branch
        }
    }
    if (branch.type === 'branch') {
        let head;
        if (getSlotIdLevel(branch.value.at(0)) === getSlotIdLevel(levelToShift)) {
            head = _getBranchPreviousOrShift(branch)
        } else {
            head = branch;
        }
        if (branch.value.length > 1) {
            const tail = branch.value.slice(1).map(el => branchShift(el, levelToShift))
            return {...head, value: head.value.slice(0,1).concat(tail)}
        } else {
            return head;
        }
    }    
    if (branch.type === 'multi') {
        return {...branch, value: branch.value.map(el => branchShift(el, levelToShift))}
    }
}