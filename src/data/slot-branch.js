import { getSlotLevel, getCurrentSlot, weight, getPreviousSlotBis, getFirstLevelSlot } from "./slot-path";

export function lowerSlotBranch(slot) {
    if (typeof slot.value.at(1) === 'object' && slot.value.at(1).type === 'multi') {
        return slot.value.at(1)
    } else if (typeof slot.value.at(1) === 'object' && slot.value.at(1).type === 'branch') {
        return slot.value.at(1);
    } else {
        return { type: slot.type, value: slot.value.slice(1)}
    }
    
}

export function firstSlotBranch(slotExpr) {
    return slotExpr.value[0];
}

/*
 * vendredi, 1 => this_month, this_week, vendredi
 * vendredi, 2 => this_week, vendredi
 */
export function completeSlotBranch(givenSlotExpr, targetLevel) {
    if (targetLevel === undefined) targetLevel = 1
    if (givenSlotExpr === undefined) return undefined;
    if (givenSlotExpr.type === 'multi') {
        return { ...givenSlotExpr,
                 value: givenSlotExpr.value.map(item => completeSlotBranch(item, targetLevel))
               }
    } else {
        const first = firstSlotBranch(givenSlotExpr);
        const level = getSlotLevel(first);
        for (let i = level - 1; i >= targetLevel; i--) {
            givenSlotExpr = appendToBranch(getCurrentSlot(i), givenSlotExpr)
        }
        return givenSlotExpr
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
        if (getWeightBranch(slotExpr) !== getWeightBranch(otherSlotExpr))
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

export function isSlotUniqueBranch(slot) {
    return isSlotSimpleBranch(slot) && !isSlotRepeat1Branch(slot);
}

export function isSlotRepeat1Branch(slot) {
    return applyTestOnBranch(slot, (slot) =>    (slot.flags      !== undefined && slot.flags.indexOf('chaque') > -1)
                                             || (slot.repetition !== undefined && slot.repetition >= 1))
}

export function isSlotRepeat2Branch(slot) {
    return applyTestOnBranch(slot, 
        (slot) => slot.repetition !== undefined && slot.repetition >= 2)
}

function applyTestOnBranch(slot, testFunc) {
    if (slot.type === 'multi') {
        return slot.value.some(item => applyTestOnBranch(item, testFunc))
    } else {
        return testFunc(slot) || slot.value.slice(1).some(item => (typeof item === 'object') && applyTestOnBranch(item, testFunc))
    }
}

export function slotTruncateBranch (tree, level) {
    if (tree.type === 'multi') {
        return { ...tree, value: tree.value.map(item => slotTruncateBranch(item, level)) }
    } else {
        const result = []
        for (const item of tree.value) {
            if (typeof item === 'object') {
                result.push(slotTruncateBranch(item, level))
            } else { // string
                if (getSlotLevel(item) <= level) {
                    result.push(item)
                } else {
                    break;
                }            
            }
        }
        return {...tree, value: result}
    }
}

/* 
 * Used by Group
 */
export function getHashBranch(tree) {
    if (tree.type === 'multi') {
        return getHashBranch(chooseSlotForSortBranch(tree))
    } else { // type branch
        tree = slotAlias(tree)
        const result = []
        for (let i = 0; i < tree.value.length; i++) {
            const item = tree.value[i];
            if (typeof item === 'string') {
                result.push(item)
            } else {
                const subresult = getHashBranch(item)
                if (subresult !== '') { 
                    result.push(subresult)
                }
            }
            if (i === 0 && tree.shift !== undefined) {
                result.push('+ ' + tree.shift)
            }
        }
        return result.join(' ');
    }
}

/*
 * Used to regenerate an expression after shifting
 */
export function slotToExpr(slot) {
    let result = []
    if (slot.type === 'multi') {
        return slot.value.map(it => slotToExpr(it)).join(' ')
    }
    slot = slotAlias(slot)
    if (slot.flags !== undefined) { result = result.concat(slot.flags) }
    if (slot.repetition !== undefined) {
        result = result.concat('every', slot.repetition)
    }
    result = result.concat(slot.value.at(0))
    if (slot.shift !== undefined && slot.shift > 0) {
        result.push('+')
        result.push(slot.shift)
    }
    slot.value.slice(1).forEach(item => result.push(typeof item === 'object' ? slotToExpr(item) : item))
    return result.join(' ')
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
            obj2 = appendToBranch(current, obj2)
            first2 = current;
            level2 = level1;
        } else if (level1 > level2) {
            const current = getCurrentSlot(level2);
            obj1 = appendToBranch(current, obj1)
            first1 = current;
            level1 = level2;
        }
        const weight1 = getWeightBranch(obj1);
        const weight2 = getWeightBranch(obj2);
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

export function isSlotSimpleBranch(tree) {
    return tree.type === 'branch' && tree.flags === undefined;
}

export function getPreviousOrShift(branch) {
    if (branch.shift !== undefined) {
        const newShift = branch.shift === 0 ? (branch.repetition !== undefined ? branch.repetition : 0) : branch.shift - 1;
        return {...branch, shift: newShift }
    } else {
        const slotId = firstSlotBranch(branch);
        const repetition = branch.repetition
        const newSlotId = getPreviousSlotBis(slotId, repetition)
        if (newSlotId === null) {
            const first = getFirstLevelSlot(getSlotLevel(firstSlotBranch(branch)))
            if (repetition === undefined) {
                return {...branch, value: [first].concat(branch.value.slice(1)) }
            } else {
                return {...branch, value: [first].concat(branch.value.slice(1)), shift: repetition }
            }
        } else {
            return {...branch, value: [newSlotId].concat(branch.value.slice(1)) }
        }
    }
}

export function slotShift (slot, levelToShift) {
    if (typeof slot === 'string') {
        if (getSlotLevel(slot) === getSlotLevel(levelToShift)) {
            return getPreviousSlotBis(slot, slot.repetition)
        } else {
            return slot
        }
    }
    if (slot.type === 'branch') {
        let head;
        if (getSlotLevel(slot.value.at(0)) === getSlotLevel(levelToShift)) {
            head = getPreviousOrShift(slot)
        } else {
            head = slot;
        }
        if (slot.value.length > 1) {
            const tail = slot.value.slice(1).map(el => slotShift(el, levelToShift))
            return {...head, value: head.value.slice(0,1).concat(tail)}
        } else {
            return head;
        }
    }    
    if (slot.type === 'multi') {
        return {...slot, value: slot.value.map(el => slotShift(el, levelToShift))}
    }
}

/**
 * append at starting
 */
export function appendToBranch(toAppend, branch) {
    if (branch.flags !== undefined || branch.shift !== undefined) {
        return { type: 'branch', value: [ toAppend, branch ] };
    } else {
        return { type: 'branch', value: [ toAppend ].concat(branch.value) };
    }
}

export function getWeightBranch(branch) {
    return weight[branch.value.at(0)] + (branch.shift === undefined ? 0 : branch.shift)
}

export function slotAlias(slot) {
    
    function transformBranch(node, aliasID) {
        const { shift, ...tmp } = {...node, value: [aliasID, ...node.value.slice(1)]}
        return tmp
    }
    
    if (slot.value[0] === 'this_week' && slot.shift && slot.shift === 1) {
        return transformBranch(slot, 'next_week')
    }
    
    if (slot.value[0] === 'this_week' && slot.shift && slot.shift === 2) {
        return transformBranch(slot, 'following_week')
    }

    if (slot.value[0] === 'next_week' && slot.shift && slot.shift === 1) {
        return transformBranch(slot, 'following_week')
    }
    
    return slot
}