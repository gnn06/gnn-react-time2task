import { isBranchEqualOrInclude } from "./slot-branch++";
import { getSlotIdLevel, getSlotIdCurrent, weight, getSlotIdPrevious, getSlotIdFirstLevel, isSlotIdGeneric, getSlotIdDistance } from "./slot-id";

export function getBranchFirstSlot(branch) {
    return branch.value[0];
}

export function getBranchLowerSlot(branch) {
    if (typeof branch.value.at(1) === 'object' && branch.value.at(1).type === 'multi') {
        return branch.value.at(1)
    } else if (typeof branch.value.at(1) === 'object' && branch.value.at(1).type === 'branch') {
        return branch.value.at(1);
    } else {
        return { type: branch.type, value: branch.value.slice(1)}
    }
    
}

export function getBranchHead(branch) {
    return {...branch, value: branch.value.slice(0,1)}
}

export function getBranchTail(branch) {
    const temp = branch.value.slice(1)
    if (typeof temp[0] === 'object') {
        if (temp.length >= 2 && typeof temp[1] === 'object') {
            return {...temp[0], value: temp[0].value.concat(temp[1])}
        } else {
            return temp[0];
        }
    } else {
        return { type: 'branch', value: temp}
    }
}

/**
 * create a branch for given level
 */
export function getBranchCurrentPath(level) {
    const branch = [];
    if (level <= 1) {
        branch.push(getSlotIdCurrent(1))
    }
    if (level <= 2) {
        branch.push(getSlotIdCurrent(2))
    }
    if (level <= 3) {
        branch.push(getSlotIdCurrent(3))
    }
    return {type:'branch',value:branch};
}

/*
 * give a weigth managing shift, weigth use only weigth on first slot. weight(this_week + 1) = get(this_week) + 1
 */
export function getBranchWeight(branch) {
    return weight[branch.value.at(0)] + (branch.shift === undefined ? 0 : branch.shift)
}

export function getBranchDistance(branch1, branch2) {
    let index1 = getBranchWeight(branch1)
    let index2 = getBranchWeight(branch2)
    const distance = (index2 - index1)
    return distance
}

/**
 * equal on first level
 * Used by isBranchEqualDeep, branchSlotIsInOther
 */
export function isBranchEqualShallow(branch1, branch2, withRepeat = false) {
    if (withRepeat && branch1.repetition !== undefined) {
        const id1 = getBranchFirstSlot(branch1)
        const id2 = getBranchFirstSlot(branch2)
        if (getSlotIdLevel(id1) !== getSlotIdLevel(id2)) {
            return false
        }
        const distance = getBranchDistance(branch1, branch2)
        return (distance >= 0 && distance % branch1.repetition === 0)
    }
    if (isSlotIdGeneric(getBranchFirstSlot(branch1))) {
        return true
    } else {
        return getBranchWeight(branch1) === getBranchWeight(branch2)
    }
}

/*
 * vendredi, 1 => this_month, this_week, vendredi
 * vendredi, 2 => this_week, vendredi
 */
export function branchComplete(branch, targetLevel) {
    if (targetLevel === undefined) targetLevel = 1
    if (branch === undefined) return undefined;
    if (branch.type === 'multi') {
        return { ...branch,
                 value: branch.value.map(item => branchComplete(item, targetLevel))
               }
    } else {
        const first = getBranchFirstSlot(branch);
        const level = getSlotIdLevel(first);
        for (let i = level - 1; i >= targetLevel; i--) {
            branch = _appendStartToBranch(getSlotIdCurrent(i), branch)
        }
        return branch
    }
}

/**
 * this_month this_week lundi with level 2 = this_month this_week
 */
export function branchTruncate (tree, level) {
    if (tree === undefined) return undefined
    if (tree.type === 'multi') {
        return { ...tree, value: tree.value.map(item => branchTruncate(item, level)) }
    } else {
        const result = []
        for (const item of tree.value) {
            if (typeof item === 'object') {
                result.push(branchTruncate(item, level))
            } else { // string
                if (getSlotIdLevel(item) <= level) {
                    result.push(item)
                } else {
                    break;
                }            
            }
        }
        return {...tree, value: result}
    }
}

export function branchRemoveDisable(node) {
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

export function isBranchSimple(tree) {
    return tree.type === 'branch' && tree.flags === undefined;
}

export function isBranchUnique(branch) {
    return isBranchSimple(branch) && !isBranchRepeat1(branch);
}

export function isBranchRepeat1(branch) {
    return _applyTestOnBranchOr(branch, (slot) =>    (slot.flags      !== undefined && slot.flags.indexOf('chaque') > -1)
                                             || (slot.repetition !== undefined && slot.repetition >= 1)
                                             || isSlotIdGeneric(getBranchFirstSlot(slot)))
}

export function isBranchRepeat2(branch) {
    return _applyTestOnBranchOr(branch, 
        (slot) => slot.repetition !== undefined && slot.repetition >= 2)
}

export function isBranchDisable(branch) {
    return _applyTestOnBranchOr(branch, branch => branch.flags && branch.flags.indexOf('disable') > -1)
}

export function isBranchMulti(branch) {
    if (branch.type === 'multi') {
        return true;
    } else {
        const tail = getBranchTail(branch)
        return tail.value.length > 0 ? isBranchMulti(tail) : false
    }
}

/*
 * Used to regenerate an expression after shifting
 */
export function branchToExpr(branch) {
    let result = []
    if (branch.type === 'multi') {
        return branch.value.map(it => branchToExpr(it)).join(' ')
    }
    branch = _branchAlias(branch)
    if (branch.flags !== undefined) { result = result.concat(branch.flags) }
    if (branch.repetition !== undefined) {
        result = result.concat('every', branch.repetition)
    }
    result = result.concat(branch.value.at(0))
    if (branch.shift !== undefined && branch.shift > 0) {
        result.push('+')
        result.push(branch.shift)
    }
    branch.value.slice(1).forEach(item => result.push(typeof item === 'object' ? branchToExpr(item) : item))
    return result.join(' ')
}

/* 
 * make unique (remove shift, disable, remove multi, apply alias)
 * Used by Group
 */
export function getBranchHash(tree) {
    if (tree === undefined) return undefined;
    if (tree.type === 'multi') {
        return getBranchHash(_chooseSlotForSortBranch(tree))
    } else { // type branch
        tree = _branchAlias(tree)
        const result = []
        for (let i = 0; i < tree.value.length; i++) {
            const item = tree.value[i];
            if (typeof item === 'string') {
                if (isSlotIdGeneric(item)) {
                    result.push(getSlotIdFirstLevel(getSlotIdLevel(item)))
                } else {
                    result.push(item)
                }
            } else {
                const subresult = getBranchHash(item)
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

/**
 * replace 'this_week + 1' into 'next_week'.
 * Use before grouping and toExpr
 */
export function _branchAlias(branch) {
    
    function transformBranch(node, aliasID) {
        const { shift, ...tmp } = {...node, value: [aliasID, ...node.value.slice(1)]}
        return tmp
    }
    
    if (branch.value[0] === 'this_week' && branch.shift && branch.shift === 1) {
        return transformBranch(branch, 'next_week')
    }
    
    if (branch.value[0] === 'this_week' && branch.shift && branch.shift === 2) {
        return transformBranch(branch, 'following_week')
    }

    if (branch.value[0] === 'next_week' && branch.shift && branch.shift === 1) {
        return transformBranch(branch, 'following_week')
    }
    
    return branch
}

export function _getBranchPreviousOrShift(branch) {
    if (branch.shift !== undefined) {
        const newShift = branch.shift === 0 ? (branch.repetition !== undefined ? branch.repetition - 1 : 0) : branch.shift - 1;
        return {...branch, shift: newShift }
    } else {
        const slotId = getBranchFirstSlot(branch);
        const repetition = branch.repetition
        const newSlotId = getSlotIdPrevious(slotId, repetition)
        if (newSlotId === null) {
            const first = getSlotIdFirstLevel(getSlotIdLevel(getBranchFirstSlot(branch)))
            if (repetition === undefined || repetition === 1) {
                return {...branch, value: [first].concat(branch.value.slice(1)) }
            } else {
                return {...branch, value: [first].concat(branch.value.slice(1)), shift: repetition - 1 }                
            }
        } else {
            return {...branch, value: [newSlotId].concat(branch.value.slice(1)) }
        }
    }
}

/**
 * internal use to transform a multi into a mono
 */
export function _chooseSlotForSortBranch (multi) {
    multi = branchRemoveDisable(multi)
    const level = getSlotIdLevel(multi.value.at(0).value.at(0))
    const todaySlot = getBranchCurrentPath(level);
    const hasToday = multi.value.find(slot => isBranchEqualOrInclude(slot, todaySlot));
    if (hasToday) {
        return hasToday
    } else {
        return multi.value[0];
    }
}

function _applyTestOnBranchOr(branch, testFunc) {
    if (branch.type === 'multi') {
        return branch.value.some(item => _applyTestOnBranchOr(item, testFunc))
    } else {
        return testFunc(branch) || branch.value.slice(1).some(item => (typeof item === 'object') && _applyTestOnBranchOr(item, testFunc))
    }
}

function _applyTestOnBranchAnd(branch, testFunc) {
    if (branch.type === 'multi') {
        return branch.value.some(item => _applyTestOnBranchAnd(item, testFunc))
    } else {
        return testFunc(branch) && branch.value.slice(1).some(item => (typeof item === 'object') && _applyTestOnBranchAnd(item, testFunc))
    }
}

/**
 * append at starting
 */
export function _appendStartToBranch(toAppend, branch) {
    if (branch.flags !== undefined || branch.shift !== undefined || branch.repetition !== undefined) {
        return { type: 'branch', value: [ toAppend, branch ] };
    } else {
        return { type: 'branch', value: [ toAppend ].concat(branch.value) };
    }
}

export function branchAppendEnd(toAppend, branch) {
    if (toAppend.flags !== undefined || toAppend.shift !== undefined || toAppend.repetition !== undefined) {
        return {...branch, value: branch.value.concat(toAppend)}
    } else {
        return {...branch, value: branch.value.concat(toAppend.value)}
    }
}
