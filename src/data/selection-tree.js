import { insideOrEqual as arrayInsideOrEqual, insideStrict } from "../utils/arrayUtil";
import { IDizer } from "../utils/stringUtil";
import { branchAppendEnd, getBranchTail } from "./slot-branch";
import { SlotPath } from "./slot-path";

export function selectionToTree(dataMap) {
    const tree = [];

    dataMap.forEach((val, path) => {
        const parts = IDizer(path)
        let currentLevel = tree;
        const { repetition, disable } = val || {};

        parts.forEach((idShifted, index) => {
            const existingNode = currentLevel.find(node => node.value === idShifted);

            if (existingNode) {
                currentLevel = existingNode.child;
                if (index === parts.length - 1) {
                    if (repetition) { existingNode.repetition = repetition }
                    if (disable) { existingNode.disable = disable }
                }
            } else {
                let newNode;
                const [result, id, plus, shift] = /(\S+)(\s+\+\s+(\d+))?/.exec(idShifted)
                if (index === parts.length - 1) {
                    newNode = { value: id, child: [], disable: disable, ...(repetition !== undefined && {repetition: repetition}), ...(shift && {shift: parseInt(shift) })};
                } else {
                    newNode = { value: id, child: [], ...(shift && {shift: parseInt(shift) }) };
                }
                currentLevel.push(newNode);
                currentLevel = newNode.child;
            }
        });
    });

    return tree.length > 0 ? tree[0] : [];
}

export function treeToSelection(tree, currentString = '') {

    function makeSelection() {
        return { selected: true, repetition: tree.repetition, disable: tree.disable || false }
    }

    function _makeID(tree) {
        let result = tree.value
        if (tree.shift) {
            result += " + " + tree.shift
        }
        return result
    }

    const result = [];

    if (Array.isArray(tree)) {
        tree.forEach(el => result.push(...treeToSelection(el)))
    } else if (!tree.child || tree.child.length === 0) {
        result.push([concatWithSep(currentString, _makeID(tree)), makeSelection(tree.repetition, tree.disable)])
    } else {
        if ((tree.repetition !== undefined && tree.repetition > 0) ||
            (tree.disable === true)) {
            result.push([concatWithSep(currentString, _makeID(tree)), makeSelection(tree.repetition, tree.disable)]);
        }
        for (const child of tree.child) {
            result.push(...treeToSelection(child, concatWithSep(currentString, _makeID(tree))));
        }
    }

    return result;
}  

export function _makeBranch(type, value, tree) {
    const {repetition, disable, shift, chaque} = tree;
    const flags = []
    if (disable) { flags.push('disable') }
    if (chaque) { flags.push('chaque') }
    return { type: type, value: value, 
        ...( repetition && { repetition }), 
        ...( flags.length > 0 && { flags }),
        ...( shift && { shift: shift})
    }
}

function _makeTree(value, child, branch) {
    const repetition = branch.repetition
    const disable = branch.flags && branch.flags.indexOf('disable') > -1
    const shift   = branch.shift
    return { value: value, 
        child: child, 
        ...(repetition && { repetition: repetition }), 
        ...(disable && { disable }),
        ...(shift && { shift })
    }
}

export function treetoBranch(tree) {
    if (tree === undefined) return undefined
    if (typeof tree === 'string') return tree

    const { value, child } = tree

    if (value === -1) {
        if (child.length > 1) {
            return { type: 'multi', value: child.map(el => treetoBranch(el))}
        } else {
            return treetoBranch(child[0])
        }
    }

    if (child && child.length === 1) {
        const childT = treetoBranch(child[0])
        // const childBranch = _makeBranch('branch', childT.value, childT)
        const branch = _makeBranch('branch', [tree.value], tree)
        return branchAppendEnd(childT, branch)
    } else if (child && child.length > 1) {
        const childTArray = child.map(item => treetoBranch(item))
        const branchChild = _makeBranch('multi', childTArray, {} )
        return _makeBranch('branch', [tree.value].concat(branchChild), tree)
    } else {
        return _makeBranch('branch', [tree.value], tree)
    }
}

export function branchToTree(branch) {
    if (branch.type === 'branch') {
        if (branch.value.length === 1) {
            return _makeTree(branch.value[0], [], branch)            
        } else {
            const tail = getBranchTail(branch)
            if (Array.isArray(tail)) {
                return _makeTree(branch.value[0], branchToTree(tail), tail)
            } else if (tail.type === 'multi') {
                return _makeTree(branch.value[0], branchToTree(tail), branch)
            } else {
                return _makeTree(branch.value[0], [ branchToTree(tail) ], branch)
            }
        }
    } else if (branch.type === 'multi') {
        return branch.value.map(item => branchToTree(item))
    }
}

export function isInsideSelected(path, selection) {
    // TODO manage "this_month + 1", use IDizer
    return Array.from(selection.keys()).some(el => el.indexOf(path) > -1)
}

function concatWithSep(str1, str2) {
    return str1 + (str1 ? ' ' : '') + str2;
}

export function selectionMapIf(selection, pathExprToMap, funcIf, funcMap) {
    // remove path, shift and add
    const pathToMap = new SlotPath(pathExprToMap)
    const result = Array.from(selection).map(([keyEl, valueEl]) => {
        const SPel = new SlotPath(keyEl)
        const match = funcIf(pathToMap, SPel)
        if (match) {
            const newKey = funcMap(SPel, pathToMap)
            return [newKey.toExpr(), valueEl]
        } else {
            return [keyEl, valueEl]
        }
    })
    return new Map(result)
}

export function selectionShift(selection, pathExprToShift, direction) {
    function funcIf(pathToMap, path) {
        return arrayInsideOrEqual(pathToMap.IDs, path.IDs)
    }
    function funcShift(path, pathToShift) {
        const level = pathToShift.getLevel()
        return path.shift(level, direction)
    }
    return selectionMapIf(selection, pathExprToShift, funcIf, funcShift)
}

export function selectionDelete(selection, pathExprToDelete) {
    const pathToDelete = new SlotPath(pathExprToDelete)    
    const lastID = pathToDelete.getLast()
    const pathDeletedExpr = new SlotPath(pathExprToDelete).delete(lastID).toExpr()
    const result = new Map();
    selection.forEach((value, key) => {
        const SPel = new SlotPath(key)
        const match = arrayInsideOrEqual(pathToDelete.IDs, SPel.IDs)
        if (match) {
            if (selection.get(pathDeletedExpr)) {
                // nothing
            } else {
                result.set(pathDeletedExpr, { selected: true})
            }
        } else {
            result.set(key, value)
        }
    })
    return result
    // -----
    /*
    const pathToDelete = new SlotPath(pathExprToDelete)
    const lastID = pathToDelete.getLast()
    const pathDeleted = new SlotPath(pathExprToDelete).delete(lastID)
    if (selection.get(pathDeleted.toExpr())) {
        selection.delete(pathExprToDelete)
    }
    const result = Array.from(selection).map(([keyEl, valueEl]) => {
        const SPel = new SlotPath(keyEl)
        const match = arrayInsideOrEqual(pathToDelete.IDs, SPel.IDs)
        if (match) {            
            const newKey = SPel.delete(lastID)
            return [newKey.toExpr(), { selected: true }]
        } else {
            return [keyEl, valueEl]
        }
    })
    return new Map(result)
    */
}

/**
 * @param {SlotPath} selection 
 * @param {SlotPath} pathExprToAdd 
 */
export function selectionAdd(selection, pathExprToAdd) {
    if (selection.size === 0) {
        return new Map([[pathExprToAdd, { selected: true }]])
    }
    const pathToMap = new SlotPath(pathExprToAdd)
    let someMatch = false
    const result = Array.from(selection).map(([keyEl, valueEl]) => {
        const SPel = new SlotPath(keyEl)
        const match = insideStrict(SPel.IDs, pathToMap.IDs)
        someMatch = someMatch || arrayInsideOrEqual(pathToMap.IDs, SPel.IDs)
        if (match && (valueEl.repetition === undefined && valueEl.disable === undefined)) {
            const newKey = pathToMap
            return [newKey.toExpr(), valueEl]
        } else {
            return [keyEl, valueEl]
        }
    })
    if (!someMatch) {
        result.push([pathExprToAdd, { selected: true }])
    }
    // if (!Array.from(selection).every(([keyEl, valueEl]) => arrayInsideOrEqual(new SlotPath(keyEl).IDs, pathToMap.IDs))) {
    //     result.push([pathExprToAdd, {selected: true}])
    // }
    return new Map(result)
}