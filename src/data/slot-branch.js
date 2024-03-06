import { getSlotLevel, getCurrentSlot, weight } from "./slot-path";

export function lowerSlotBranch(slot) {
    if (typeof slot.value.at(1) === 'object' && slot.value.at(1).type === 'multi') {
        return slot.value.at(1)
    } else {
        return { type: slot.type, value: slot.value.slice(1)}
    }
    
}

export function firstSlotBranch(slotExpr) {
    return slotExpr.value[0];
}

export function completeSlotBranch(givenSlotExpr, targetLevel) {
    if (targetLevel === undefined) targetLevel = 1
    if (givenSlotExpr === undefined) return undefined;
    const first = firstSlotBranch(givenSlotExpr);
    const level = getSlotLevel(first);
    let newValue = givenSlotExpr.value;
    for (let i = level - 1; i >= targetLevel; i--) {
        newValue = [getCurrentSlot(i)].concat(newValue)
    }
    return { type: givenSlotExpr.type,
        flags: givenSlotExpr.flags,
        value: newValue
    }
}

export function getCurrentPathBranch(level) {
    const branch = [];
    if (level <= 1) {
        branch.push(getCurrentSlot(1))
    }
    if (level <= 2) {
        branch.push(getCurrentSlot(2))
    }
    if (level <= 3) {
        branch.push(getCurrentSlot(3))
    }
    return {type:'branch',value:branch};
}

export function chooseSlotForSortBranch (multi) {
    multi = removeDisableBranch(multi)
    const level = getSlotLevel(multi.value.at(0).value.at(0))
    const todaySlot = getCurrentPathBranch(level);
    const hasToday = multi.value.find(slot => slotIsInOtherBranch(slot, todaySlot));
    if (hasToday) {
        return hasToday
    } else {
        return multi.value[0];
    }
}

export function removeDisableBranch(node) {
    if (node.type === 'multi') {
        return {
            type: node.type,
            flags: node.flags,
            value: node.value.filter(item => !item.flags || item.flags.indexOf('disable') < 0)
        }
    } else {
        if (node.flags === undefined || node.flags.indexOf('disable') < 0) {
            return node;
        } else {
            return null;
        }
    }
}

export function slotIsInOtherBranch(slotExpr, otherSlotExpr) {
    if (slotExpr === undefined || otherSlotExpr === undefined) return false;
    if (otherSlotExpr.type !== 'branch') {
        throw new Error('slotIsInOtherBranch param otherSlotExpr should not be multi');
    }
    slotExpr = removeDisableBranch(slotExpr)
    if (slotExpr === null) return false;
    if (slotExpr.type === 'branch' && otherSlotExpr.type === 'branch') {
        let first = firstSlotBranch(slotExpr)
        let firstOther = firstSlotBranch(otherSlotExpr)
        const level1 = getSlotLevel(first)
        const level2 = getSlotLevel(firstOther)
        if (level1 < level2) {
            otherSlotExpr = completeSlotBranch(otherSlotExpr, level1)
            firstOther = firstSlotBranch(otherSlotExpr)
        } else if (level1 > level2) {
            slotExpr = completeSlotBranch(slotExpr, level2)
            first = firstSlotBranch(slotExpr)
        }
        //slotExpr = completeSlotBranch(slotExpr)
        //otherSlotExpr = completeSlotBranch(otherSlotExpr)
        // first level is different, no need to go next level
        if (first !== firstOther)
            return false;
        else {
            const lower = lowerSlotBranch(slotExpr);
            const lowerOther = lowerSlotBranch(otherSlotExpr);
            // other has no more level so previous level egality is enough
            if (lowerOther.value.length === 0) 
                return true;
            else
                // need to check at next level
                return slotIsInOtherBranch(lower, lowerOther);   
        }
    } else if (slotExpr.type === 'multi' && otherSlotExpr.type === 'branch') {
        return slotExpr.value.some(slot => slotIsInOtherBranch(slot, otherSlotExpr))
    }
}

export function isSlotRepeat1Branch(slot) {
    return applyTestOnBranch(slot, 
        (slot) => slot.flags !== undefined && (slot.flags.indexOf('chaque') > -1 || slot.flags.indexOf('EVERY2') > -1))
}

export function isSlotRepeat2Branch(slot) {
    return applyTestOnBranch(slot, 
        (slot) => slot.flags !== undefined && (slot.flags.indexOf('EVERY2') > -1))
}

function applyTestOnBranch(slot, testFunc) {
    if (slot.type === 'multi') {
        return slot.value.some(item => applyTestOnBranch(item, testFunc))
    } else {
        return testFunc(slot) || slot.value.slice(1).some(item => (typeof item === 'object') && applyTestOnBranch(item, testFunc))
    }
}

export function slotCompareBranch(obj1, obj2) {
    if (obj1 === undefined || (obj1.flags && obj1.flags.indexOf('disable') >= 0))
        return 1;
    if (obj2 === undefined || (obj2.flags && obj2.flags.indexOf('disable') >= 0))
        return -1;
    if (obj1.type === 'branch' && obj2.type === 'branch') {
        let first1 = obj1.value.at(0);
        let first2 = obj2.value.at(0);
        let level1 = getSlotLevel(first1);
        let level2 = getSlotLevel(first2)
        if (level1 < level2) {
            const current = getCurrentSlot(level1);
            obj2 = { type:'branch', value: [current].concat(obj2.value)};
            first2 = current;
            level2 = level1;
        } else if (level1 > level2) {
            const current = getCurrentSlot(level2);
            obj1 = { type:'branch', value: [current].concat(obj1.value)};
            first1 = current;
            level1 = level2;
        }
        const weight1 = weight[first1];
        const weight2 = weight[first2];
        if (weight1 < weight2)
            return -1
        else if (weight1 > weight2)
            return 1
        else {
            const lower1 = lowerSlotBranch(obj1)
            const lower2 = lowerSlotBranch(obj2)
            if (lower1.value.length === 0 && lower2.value.length === 0)
                return 0
            if (lower1.value.length !== 0 && lower2.value.length !== 0) 
                return slotCompareBranch(lower1, lower2)
            if (lower1.value.length !== 0 && lower2.value.length === 0) 
                return -1
            else
                return 1
        }
    } else if (obj1.type === 'multi' && obj2.type === 'branch') {
        return slotCompareBranch(chooseSlotForSortBranch(obj1), obj2)
    } else if (obj1.type === 'branch' && obj2.type === 'multi') {
        return slotCompareBranch(obj1, chooseSlotForSortBranch(obj2))
    } else if (obj1.type === 'multi' && obj2.type === 'multi') {
        return slotCompareBranch(chooseSlotForSortBranch(obj1), chooseSlotForSortBranch(obj2))
    }

}