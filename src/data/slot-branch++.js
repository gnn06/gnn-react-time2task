import { _chooseSlotForSortBranch, _getBranchPreviousOrShift, branchRemoveDisable, getBranchFirstSlot, getBranchLowerSlot,
          getBranchWeight, getBranchTail, isBranchEqualShallow } from "./slot-branch";
import { getSlotIdFamily, getSlotIdFamilyRank, getSlotIdLevel, getSlotIdPrevious } from "./slot-id";

/**
 * differs from isBranchEqualOrInclude isBranchEqualDeep('this_week lundi', 'this_week') = false)
 * require params should be completed
 * param branch1 complete
 * param branch2 complete and mono
 * used by slotEqual
 * used by filtering with NONE, slotView on not terminal node (findTaskBySlotExpr)
 */
export function isBranchEqualDeep(branch1, branch2, withRepeat = false) {
    if (branch1 === undefined) return false;
    branch1 = branchRemoveDisable(branch1)
    if (branch1 === null) return false;
    if (branch1.type === 'multi') {
        return branch1.value.some(branch => isBranchEqualDeep(branch, branch2, withRepeat))
    }
    if (branch1.value.length === 1 && branch2.value.length === 1) {
        return isBranchEqualShallow(branch1, branch2, withRepeat)
    } else {
        if (isBranchEqualShallow(branch1, branch2, withRepeat) === false) {
            return false
        } else {
            const tail1 = getBranchTail(branch1)
            const tail2 = getBranchTail(branch2)
            return isBranchEqualDeep(tail1, tail2, withRepeat)
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
export function isBranchEqualOrInclude(branch1, branch2, withRepeat = false) {
    if (branch1 === undefined || branch2 === undefined) return false;
    if (branch2.type !== 'branch') {
        throw new Error('slotIsInOtherBranch param otherSlotExpr should not be multi');
    }
    branch1 = branchRemoveDisable(branch1)
    if (branch1 === null) return false;
    if (branch1.type === 'branch' && branch2.type === 'branch') {
        if (!isBranchEqualShallow(branch1, branch2, withRepeat))
            return false;
        else {
            const lower = getBranchTail(branch1);
            const lowerOther = getBranchTail(branch2);
            // other has no more level so previous level egality is enough
            if (lowerOther.value.length === 0) 
                return true;
            else
                // need to check at next level
                return isBranchEqualOrInclude(lower, lowerOther, withRepeat);   
        }
    } else if (branch1.type === 'multi' && branch2.type === 'branch') {
        return branch1.value.some(slot => isBranchEqualOrInclude(slot, branch2, withRepeat))
    }
}

/**
 * Ordonne deux créneaux : compare niveau par niveau, du plus grossier au plus fin.
 *
 * Règle de famille — à niveau égal, la famille tranche **avant** le poids : joker, puis
 * `relatifPresent`, puis `relatifParent` (`getSlotIdFamilyRank`). Sans elle, `today` et
 * `lundi` seraient indiscernables (weight 1 tous les deux) : les deux familles partagent
 * l'échelle du niveau jour. `today`/`tomorrow` ouvrent donc le niveau, devant les weekdays,
 * sans projection ni lecture de `snapDates` — l'ordre ne bouge pas au « Démarrer Jour ».
 *
 * Règle de profondeur — à poids égal, **le précis passe avant l'imprécis** : la branche qui
 * se prolonge d'un niveau vient en premier (`this_week lundi` < `this_week`,
 * `today matin` < `today aprem` < `today`). Un slot sans complément se lit comme une échéance
 * de *fin de conteneur* : il ferme son bloc. La règle vaut à tous les niveaux et pour les deux
 * familles (cf. docs/slot-model-spec.md § 10).
 *
 * Un slot `disable` est renvoyé en dernier. Un `multi` est comparé sur un seul de ses slots
 * (cf. `_chooseSlotForSortBranch`).
 *
 * @param branch1 branche complète (cf. `branchComplete`)
 * @param branch2 branche complète
 * @returns -1 | 0 | 1
 */
export function branchCompare(branch1, branch2) {
    if (branch1 === undefined || (branch1.flags && branch1.flags.indexOf('disable') >= 0))
        return 1;
    if (branch2 === undefined || (branch2.flags && branch2.flags.indexOf('disable') >= 0))
        return -1;
    if (branch1.type === 'branch' && branch2.type === 'branch') {
        const familyRank1 = getSlotIdFamilyRank(getBranchFirstSlot(branch1));
        const familyRank2 = getSlotIdFamilyRank(getBranchFirstSlot(branch2));
        if (familyRank1 !== familyRank2)
            return familyRank1 < familyRank2 ? -1 : 1
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
    if (branch === undefined) return undefined
    if (typeof branch === 'string') {
        const sameLevel = getSlotIdLevel(branch) === getSlotIdLevel(levelToShift);
        const relatifPresentOnly = getSlotIdFamily(levelToShift) === 'generic'
            && getSlotIdFamily(branch) !== 'relatifPresent';
        if (sameLevel && !relatifPresentOnly) {
            return getSlotIdPrevious(branch, branch.repetition)
        } else {
            return branch
        }
    }
    if (branch.type === 'branch') {
        let head;
        const headId = branch.value.at(0);
        const sameLevelBranch = getSlotIdLevel(headId) === getSlotIdLevel(levelToShift);
        const relatifPresentOnlyBranch = getSlotIdFamily(levelToShift) === 'generic'
            && getSlotIdFamily(headId) !== 'relatifPresent';
        if (sameLevelBranch && !relatifPresentOnlyBranch) {
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

