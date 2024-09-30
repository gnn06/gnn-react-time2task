import { isSlotRepeat2, isSlotRepeat1, slotCompare, isSlotEqual, isSlotEqualOrInclude, isSlotUnique, isSlotMulti } from './slot-expr';
import { makeFilterCombine }  from './filter-engine.js';
import { Parser } from "./parser";
import _ from 'lodash';
import { branchComplete, branchToExpr, branchTruncate, getBranchHash, isBranchDisable, isBranchMulti } from './slot-branch';
import { branchShift } from './slot-branch++';

export function taskPredicateEqualAndInclude(task, filter) {
    return isSlotEqualOrInclude(task.slotExpr, filter)
}

export function taskPredicateEqual(task, filter) {
    return isSlotEqual(task.slotExpr, filter)
}

export function taskPredicateNoRepeat(task) {
    return !isSlotRepeat1(task.slotExpr);
}

export function taskPredicateEvery1(task) {
    return isSlotRepeat1(task.slotExpr);
}

export function taskPredicateEvery2(task) {
    return isSlotRepeat2(task.slotExpr);
}

export function taskPredicateMulti(task) {
    const branch = parser.parse(task.slotExpr)
    if (branch === undefined) return false;
    return isBranchMulti(branch)
}

export function taskPredicateDisable(task) {
    const branch = parser.parse(task.slotExpr)
    if (branch === undefined) return false;
    return isBranchDisable(branch)
}

export function taskPredicateStatus(task) {
    return ['fait-à repositinner'].indexOf(task.status) > -1;
}

/* public, used by apiSlice.js */
export function taskCompare(task1, task2) {
    // if multi slot, compare on the first one
    const slotComp = slotCompare(task1.slotExpr, task2.slotExpr)
    if (slotComp === 0) {
        // put no order task at begin
        const order1 = task1.order === undefined || task1.order === null ? 999 : task1.order
        const order2 = task2.order === undefined || task2.order === null ? 999 : task2.order
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

/**
 * filter a task list on a filter expression
 * @param {string} filterExpr expression. (mono incomplet slotPath) with OR
 * public, used by slot.jsx and tasklist.jsx
 */
export function filterSlotExpr(tasks, filter) {
    // if (filterExpr === 'no-filter') return tasks;
    return tasks.filter(makeFilterCombine(filter).func);
}

/**
 * filter the task list included in a slot. used by slot view.
 * @param {*} tasks 
 * @param {*} slot with a path
 * @returns [tasks filtered]
 * public, used by slot.jsx 
 */
export function findTaskBySlotExpr(tasks, slot) {
    if (slot.inner !== undefined && slot.inner && slot.inner.length !== 0) {
        return tasks.filter(task => isSlotEqual(task.slotExpr, slot.path));
    } else {
        return tasks.filter(task => isSlotEqualOrInclude(task.slotExpr, slot.path));
    }
}

const parser = new Parser()

export function taskGroup(tasks, level) {
    const toto = _.groupBy(tasks, item => {try {
        return getBranchHash(branchTruncate(branchComplete(parser.parse(item.slotExpr)), level))
    } catch (error) {
        console.error(error, ' caused by ', item)
        return ''
    }
    })
    return toto;
}

/**
 * tasks shift, returns only task that shift, put oldSlotExpr into task 
 */
export function taskShiftFilter(tasks, level) {
    const tasksTree = tasks.map(item => parser.parse(item.slotExpr))
    
    const newTree = tasksTree.map(item => branchShift(item, level))

    const result = []
    for (let i = 0; i < newTree.length; i++) {
        try {
            if (!_.isEqual(newTree[i], tasksTree[i])) {
                result.push({...tasks[i], slotExpr: branchToExpr(newTree[i]), oldSlotExpr: tasks[i].slotExpr})
            }
        } catch (error) {
            console.error(error, 'caused by ', tasks[i], tasksTree[i], newTree[i])
        }
    }
    return result
}

export function isTaskUnique(task) {
    return isSlotUnique(task.slotExpr)
}

export function isTaskMulti(task) {
    return isSlotMulti(task.slotExpr)
}

export function isTaskRepeat(task) {
    return isSlotRepeat1(task.slotExpr)    
}