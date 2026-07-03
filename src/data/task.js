import { isSlotRepeat2, isSlotRepeat1, slotCompare, isSlotEqual, isSlotEqualOrInclude, isSlotUnique, isSlotMulti } from './slot-expr';
import { makeFilterCombine }  from './filter-engine.js';
import { Parser } from "./parser";
import _ from 'lodash';
import { branchComplete, branchToExpr, branchTruncate, getBranchHash, isBranchDisable, isBranchMulti, branchHasRelatifParentDay, branchHasPathWithoutWeekDay, branchGetRelatifPresentDayId, branchGetRelatifParentDayId } from './slot-branch';
import moment from 'moment';
import { getDate, getDefaultDates } from './slot-date';
import { getSlotIdLevel, getSlotIdFamily, SLOTIDS_BY_LEVEL, weight } from './slot-id';
import { IDizer } from '../utils/stringUtil';
import { slotHasImpreciseIcon } from './slot-view';
import { branchShift } from './slot-branch++';
import { SlotPath, getCurrentPathExpr } from './slot-path';
import { getSlotNextPrev } from './slot-next-prev';

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

export function taskPredicateStatus(task, status) {
    return task.status === status;
}

export function isTaskImprecise(task, levelMaxIncluded) {
    const branch = parser.parse(task.slotExpr)
    if (branch === undefined) return false
    const hash = getBranchHash(branchComplete(branch))
    if (!hash) return false
    const idPath = IDizer(hash)
    const path = idPath.join(' ')
    const level = idPath.length
    const maxLevel = levelMaxIncluded ?? 3
    return level <= maxLevel && slotHasImpreciseIcon(path, level)
}

export function makeTaskPredicateImprecise(levelMaxIncluded) {
    return (task) => isTaskImprecise(task, levelMaxIncluded)
}

export function taskPredicateId(task, id) {
    return task.id === id;
}

export function taskPredicateError(task) {
    try {
        const branch = parser.parse(task.slotExpr)
        return branch === undefined || ['branch', 'multi'].indexOf(branch.type) === -1;
    } catch (error) {
        return true        
    }
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
    // if (filterExpr === '') return tasks;
    return tasks.filter(makeFilterCombine(filter).func);
}

/**
 * filter the task list included in a slot. used by slot view.
 * filter task on slot or on not existng slot
 * this_week, this_week => true
 * this_week vendredi, this_week mercredi => true
 * this_week mercredi aprem, this_week => false
 * @param {*} tasks 
 * @param {*} slot with a path
 * @returns [tasks filtered]
 * public, used by slot.jsx 
 */
export function findTaskBySlotExpr(tasks, slot, includeRepeat = true) {
    // function (this_week vendredi, (this_week, this_week mercredi)) => true
    
    let result = tasks.filter(task => isSlotEqualOrInclude(task.slotExpr, slot.path, includeRepeat));
    if (slot.inner !== undefined) {
        _.remove(result, task => slot.inner.some(innerSlot => isSlotEqualOrInclude(task.slotExpr, innerSlot.path, includeRepeat)));
    }
    return result;
}

const parser = new Parser()

/**
 * 
 * @param {*} tasks 
 * @param {*} level 
 * @returns object { 'this_month this_week': [task1, task2] , ... }
 */
export function taskGroupLevel(tasks, level) {
    const result = _.groupBy(tasks, item => {
        try {
            const branch = parser.parse(item.slotExpr)
            return getBranchHash(branchTruncate(branchComplete(branch), level))
        } catch (error) {
            console.error(error, ' caused by ', item)
            return ''
        }
    })
    return result;
}

export function taskGroupActivity(tasks) {
    const result = _.groupBy(tasks, 'activity');
    return result;
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

/**
 * Routage vue tree/list (v1 partition) : vrai si la tâche a un jour relatifParent
 * (lundi..vendredi) → vue tree ; faux (purement relatifPresent) → vue list.
 */
export function taskHasRelatifParentDay(task) {
    const branch = parser.parse(task.slotExpr)
    return branch ? branchHasRelatifParentDay(branch) : false
}

export function taskHasRelatifPresentDay(task) {
    const branch = parser.parse(task.slotExpr)
    return branch ? branchGetRelatifPresentDayId(branch) !== null : false
}

/** Vrai si la tâche admet au moins un créneau (chemin) sans jour précis (lundi..vendredi). */
export function taskHasPathWithoutWeekDay(task) {
    const branch = parser.parse(task.slotExpr)
    return branch ? branchHasPathWithoutWeekDay(branch) : false
}

/**
 * Partition des tâches affichées en vue list.
 * Base : pas de jour relatifParent, OU a un jour relatifPresent (tâches mixtes).
 * Si conf.includeWeekDays : ajoute les tâches purement relatifParent (lundi..vendredi),
 * projetées sur le cadre relatifPresent (today/tomorrow, sinon this_week) via
 * taskRelativeParentToPresent.
 */
export function getListTasks(tasks, conf, snapDates = []) {
    const listTasks = tasks.filter(t => !taskHasRelatifParentDay(t) || taskHasRelatifPresentDay(t))
    if (!conf?.includeWeekDays) return listTasks
    const projected = tasks
        .filter(t => taskHasRelatifParentDay(t) && !taskHasRelatifPresentDay(t))
        .map(t => taskRelativeParentToPresent(t, snapDates))
        .filter(Boolean)
    return [...listTasks, ...projected]
}

/**
 * DORMANT — projection à réintroduire. Depuis la « vérité unique » (task-container),
 * les deux panneaux sont alimentés par filterSlotExpr et cette fonction n'est plus
 * appelée. Conservée (avec getListTasks et les primitives taskRelativeParentToPresent /
 * slotPathToPresent) pour rebrancher la projection weekday→today/tomorrow quand la
 * décision bubbling vs projection sera tranchée.
 *
 * Tâches affichées par le SlotPanel : projection vue list (si view==='list')
 * puis filtre courant. La projection précède le filtre pour que ce dernier opère
 * sur l'expression projetée (ex : tâche weekday projetée sur today, filtrée par today).
 */
export function getListTasksFiltered(tasks, conf, filter, snapDates = []) {
    const base = conf?.view === 'list' ? getListTasks(tasks, conf, snapDates) : tasks
    const slots = conf?.view === 'list' && filter?.slots?.length
        ? filter.slots.map(s => slotPathToPresent(s, snapDates))
        : filter?.slots
    return filterSlotExpr(base, { ...filter, slots })
}

// statuts pour lesquels le jour courant compte comme prochain slot
const ACTIVE_STATUSES = ['A faire', 'en cours']

/**
 * Retourne l'expression du prochain slot d'une tâche, ou null si aucun.
 * branchComplete(branch, 1) complète les slots incomplets (ex: "lundi" → "this_week lundi").
 * Pour les statuts actifs ('A faire', 'en cours'), aujourd'hui est inclus comme prochain slot.
 * @returns {string|null}
 */
export function getTaskNextSlotLabel(task) {
    const branch = parser.parse(task.originalSlotExpr ?? task.slotExpr)
    if (!branch) return null
    const completed = branchComplete(branch, 1)
    const currentPath = new SlotPath(getCurrentPathExpr(4))
    const comparison = ACTIVE_STATUSES.includes(task.status) ? 'inclusive' : 'strict'  // 'inclusive' = statut actif, aujourd'hui compte
    const result = getSlotNextPrev(completed, currentPath, +1, comparison)
    if (!result) return null
    return result.mostInformativeId(currentPath)
}

export function getNewOrder(tasks, activeId, overId) {
    const overIndex = tasks.findIndex(el => el.id === overId);
    const activeIndex = tasks.findIndex(el => el.id === activeId);
    const isMovingDown = overIndex < activeIndex;

    const overElement = tasks[overIndex];
    let adjacentElement;
    if (isMovingDown) {
        adjacentElement = tasks[overIndex - 1];
    } else {
        adjacentElement = tasks[overIndex + 1];
    }
    // adjacent undefined if drop on first position or last position

    const overOrder = overElement.order;
    const adjacentOrder = adjacentElement?.order;

    let newOrder;
    if (!adjacentOrder) {
        if (isMovingDown) {
            newOrder = overOrder / 2.0;
        } else {
            newOrder = overOrder + 1.0;
        }
    } else {
        newOrder = (adjacentOrder + overOrder) / 2.0;
    }
    return newOrder;
}

/**
 * Projette une tâche relatifPresent (today/tomorrow) vers son weekday projeté.
 * Retourne une tâche fantôme ou null si inapplicable (weekend, pas d'ancre
 * jour relatifPresent, hors this_week/next_week).
 * Le contexte semaine/mois est basé sur moment() courant, pas sur les snapDates
 * stockés qui peuvent être périmés (ex : semaine non avancée).
 */
export function taskRelativePresentToParent(task, snapDates) {
    const branch = parser.parse(task.slotExpr)
    if (!branch) return null

    const anchorId = branchGetRelatifPresentDayId(branch)
    if (!anchorId) return null

    // Si today n'est pas en base (Phase E non faite), les snapDates stockés peuvent
    // être incohérents avec la date réelle. On utilise alors getDefaultDates() comme
    // référence cohérente pour tous les calculs — aujourd'hui ET la semaine courante.
    const hasTodayInDB = snapDates.some(el => el.slotid === 'today')
    const referenceDates = hasTodayInDB ? snapDates : getDefaultDates()

    const projectedDateStr = getDate({ id: anchorId }, referenceDates)
    if (!projectedDateStr) return null

    const projMoment = moment(projectedDateStr)
    const isoDay = projMoment.isoWeekday()  // 1=lun..7=dim
    if (isoDay > 5) return null  // weekend

    const weekdayId = SLOTIDS_BY_LEVEL['3'][isoDay - 1]

    const thisWeekStr = getDate({ id: 'this_week' }, referenceDates)
    const thisWeekMoment = moment(thisWeekStr)
    const weekDiff = (projMoment.isoWeekYear() - thisWeekMoment.isoWeekYear()) * 53
                   + (projMoment.isoWeek() - thisWeekMoment.isoWeek())
    let weekId
    if (weekDiff === 0) weekId = 'this_week'
    else if (weekDiff === 1) weekId = 'next_week'
    else return null

    const thisMonthStr = getDate({ id: 'this_month' }, referenceDates)
    const monthDiff = projMoment.diff(moment(thisMonthStr, 'YYYY-MM'), 'months')
    let monthId
    if (monthDiff === 0) monthId = 'this_month'
    else if (monthDiff === 1) monthId = 'next_month'
    else return null

    // Heure (matin/aprem) préservée si présente
    const completed = branchComplete(branch)
    const hash = getBranchHash(completed) ?? ''
    const hourToken = hash.split(' ').find(t => getSlotIdLevel(t) === 4) ?? null

    let projectedSlotExpr = `${monthId} ${weekId} ${weekdayId}`
    if (hourToken) projectedSlotExpr += ` ${hourToken}`

    return { ...task, slotExpr: projectedSlotExpr, originalSlotExpr: task.slotExpr }
}

/**
 * Projette un slotExpr weekday (lundi..vendredi) vers 'today' ou 'tomorrow' si le jour
 * correspond. Retourne le slotExpr inchangé si aucune correspondance (jour passé ou futur).
 * Heure (matin/aprem) préservée.
 */
export function slotPathToPresent(slotExpr, snapDates = []) {
    if (!slotExpr) return slotExpr
    const branch = parser.parse(slotExpr)
    if (!branch) return slotExpr

    const weekdayId = branchGetRelatifParentDayId(branch)
    if (!weekdayId) return slotExpr

    const hasTodayInDB = snapDates.some(el => el.slotid === 'today')
    const referenceDates = hasTodayInDB ? snapDates : getDefaultDates()

    const completed = branchComplete(branch)
    const hash = getBranchHash(completed) ?? ''
    const hourToken = hash.split(' ').find(t => getSlotIdLevel(t) === 4) ?? null
    const weekToken = hash.split(' ').find(t => getSlotIdLevel(t) === 2) ?? 'this_week'

    // Date réelle du weekday dans SA semaine : lundi de weekToken + offset du jour.
    // getDate({ id: weekday }) résoudrait toujours dans this_week, d'où la projection
    // erronée d'un « next_week mardi » sur today.
    const weekStartStr    = getDate({ id: weekToken }, referenceDates)
    const dayOffset       = weight[weekdayId] - 1
    const weekdayDateStr  = moment(weekStartStr).add(dayOffset, 'days').format('YYYY-MM-DD')
    const todayDateStr    = getDate({ id: 'today'    }, referenceDates)
    const tomorrowDateStr = getDate({ id: 'tomorrow' }, referenceDates)

    let anchorId
    if      (weekdayDateStr === todayDateStr)    anchorId = 'today'
    else if (weekdayDateStr === tomorrowDateStr) anchorId = 'tomorrow'

    if (!anchorId) return slotExpr
    return anchorId + (hourToken ? ` ${hourToken}` : '')
}

export function taskRelativeParentToPresent(task, snapDates) {
    const branch = parser.parse(task.slotExpr)
    if (!branch) return null

    const weekdayId = branchGetRelatifParentDayId(branch)
    if (!weekdayId) return null

    const projectedSlotExpr = slotPathToPresent(task.slotExpr, snapDates)

    // sinon (jour passé ou ≥ après-demain) → troncature au niveau semaine :
    // la tâche remonte à this_week via le bubbling de la list.
    let finalSlotExpr
    if (projectedSlotExpr !== task.slotExpr) {
        finalSlotExpr = projectedSlotExpr
    } else {
        finalSlotExpr = getBranchHash(branchTruncate(branchComplete(branch), 2)) ?? ''
    }

    return { ...task, slotExpr: finalSlotExpr, originalSlotExpr: task.slotExpr }
}
