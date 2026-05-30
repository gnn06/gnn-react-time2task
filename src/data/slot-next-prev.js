import { weight, getSlotIdIndex, getSlotIdLevel, getSlotIdNextPrev } from './slot-id'
import { SlotPath } from './slot-path'

/**
 * Retourne le prochain slot d'une tâche futur par rapport à slotPath.
 * @param {SlotBranch} slot - branche issue du parser (unique, multi-jour ou repeat)
 * @param {SlotPath} slotPath - représente "maintenant" ; ne lit pas la date courante
 * @param {number} direction - seul +1 est traité
 * @param {'strict'|'inclusive'} comparison - 'inclusive' : le créneau courant compte (>=) ; 'strict' : uniquement l'avenir (>)
 * @returns {SlotPath|null} null = pas de prochain slot
 */
export function getSlotNextPrev(slot, slotPath, direction, comparison = 'strict') {
    return getNextPrevBranch(slot, slotPath, comparison)
}

function getNextPrevBranch(branch, slotPath, comparison) {
    // multi au niveau racine (ex: 'this_month next_month') : retourner le premier slot valide
    if (branch.type === 'multi') {
        for (const sub of branch.value) {
            const result = getNextPrevBranch(sub, slotPath, comparison)
            if (result) return result
        }
        return null
    }

    const weekId = branch.value.find(v => typeof v === 'string' && getSlotIdLevel(v) === 2)

    if (!weekId) {
        // branchComplete(branch, 1) enveloppe les branches repeat dans un nœud mois sans weekId au premier niveau
        const inner = branch.value.find(v => typeof v === 'object' && v.type === 'branch')
        if (inner) return getNextPrevBranch(inner, slotPath, comparison)

        // slot de niveau mois uniquement (ex: 'next_month') : comparer les mois
        const monthId = branch.value.find(v => typeof v === 'string' && getSlotIdLevel(v) === 1)
        if (monthId) {
            const pathMonthId = slotPath.IDs.find(id => getSlotIdLevel(id) === 1)
            const monthIdx = getSlotIdIndex(monthId)
            const pathMonthIdx = getSlotIdIndex(pathMonthId)
            if (monthIdx > pathMonthIdx) return new SlotPath(monthId)
            if (monthIdx === pathMonthIdx) return comparison === 'inclusive' ? new SlotPath(monthId) : null
            return null
        }

        return null
    }

    // extraire jour (level-3), heure (level-4) et nœud multi séparément
    const dayId     = branch.value.find(v => typeof v === 'string' && getSlotIdLevel(v) === 3)
    const hourId    = branch.value.find(v => typeof v === 'string' && getSlotIdLevel(v) === 4)
    const multiNode = branch.value.find(v => typeof v !== 'string')

    const pathWeekId  = slotPath.IDs.find(id => getSlotIdLevel(id) === 2)
    const pathDayId   = slotPath.IDs.find(id => getSlotIdLevel(id) === 3)
    const pathHourId  = slotPath.IDs.find(id => getSlotIdLevel(id) === 4)

    const weekIdx     = getSlotIdIndex(weekId)
    const pathWeekIdx = getSlotIdIndex(pathWeekId)

    if (weekIdx > pathWeekIdx) {
        // semaine future : retourner le premier jour du slot (ou la semaine seule)
        return firstSlotPath(weekId, dayId, hourId, multiNode)
    }

    if (weekIdx < pathWeekIdx) {
        // semaine passée : avancer d'une période pour les repeat, sinon null
        if (!branch.repetition) return null
        return firstSlotPath(getSlotIdNextPrev(weekId, branch.repetition), dayId, hourId, multiNode)
    }

    // même semaine : comparer au niveau du jour
    if (!dayId && !multiNode) return new SlotPath(weekId)  // slot = semaine entière, toujours valide

    const pathDayW  = weight[pathDayId]  ?? 0
    const pathHourW = weight[pathHourId] ?? 0

    if (dayId) {
        const dayW = weight[dayId] ?? 0
        if (dayW > pathDayW) return firstSlotPath(weekId, dayId, hourId, multiNode)
        if (dayW < pathDayW) {
            if (!branch.repetition) return null
            return firstSlotPath(getSlotIdNextPrev(weekId, branch.repetition), dayId, hourId, multiNode)
        }
        // même jour : comparer les heures
        if (!hourId && !multiNode) {
            if (comparison === 'inclusive') return new SlotPath(`${weekId} ${dayId}`)
            if (!branch.repetition) return null
            return firstSlotPath(getSlotIdNextPrev(weekId, branch.repetition), dayId, null, null)
        }
        if (hourId) {
            // heure unique
            const hourW = weight[hourId] ?? 0
            const cmp = comparison === 'inclusive' ? hourW >= pathHourW : hourW > pathHourW
            if (cmp) return new SlotPath(`${weekId} ${dayId} ${hourId}`)
            if (!branch.repetition) return null
            return firstSlotPath(getSlotIdNextPrev(weekId, branch.repetition), dayId, hourId, null)
        }
        // multi d'heures sur le même jour (ex: 'mercredi matin aprem')
        const hours = multiNode.value
            .map(b => b.value[0])
            .sort((a, b) => (weight[a] ?? 0) - (weight[b] ?? 0))
        const nextHour = hours.find(h => comparison === 'inclusive' ? (weight[h] ?? 0) >= pathHourW : (weight[h] ?? 0) > pathHourW)
        if (nextHour) return new SlotPath(`${weekId} ${dayId} ${nextHour}`)
        if (!branch.repetition) return null
        return firstSlotPath(getSlotIdNextPrev(weekId, branch.repetition), dayId, null, multiNode)
    }

    // multi : {type:'multi', value:[{type:'branch', value:[dayString, ?hourString]}, ...]}
    // trier par (jour, heure) pour trouver le premier encore valide
    const items = multiNode.value
        .map(b => ({
            day:  b.value.find(v => getSlotIdLevel(v) === 3),
            hour: b.value.find(v => getSlotIdLevel(v) === 4),
        }))
        .sort((a, b) => {
            const d = (weight[a.day] ?? 0) - (weight[b.day] ?? 0)
            return d !== 0 ? d : (weight[a.hour] ?? 0) - (weight[b.hour] ?? 0)
        })

    const next = items.find(item => {
        const dayW = weight[item.day] ?? 0
        if (dayW > pathDayW) return true
        if (dayW < pathDayW) return false
        // même jour : comparer l'heure
        if (!item.hour) return comparison === 'inclusive'
        const hourW = weight[item.hour] ?? 0
        return comparison === 'inclusive' ? hourW >= pathHourW : hourW > pathHourW
    })

    if (next) return slotPathFromItem(weekId, next)
    if (!branch.repetition) return null
    // tous les items sont passés : revenir au premier de la prochaine période
    return slotPathFromItem(getSlotIdNextPrev(weekId, branch.repetition), items[0])
}

// construit un SlotPath à partir d'un weekId et des composantes jour/heure/multi du premier slot
function firstSlotPath(weekId, dayId, hourId, multiNode) {
    if (!dayId && !multiNode) return new SlotPath(weekId)
    if (dayId) {
        if (hourId) return new SlotPath(`${weekId} ${dayId} ${hourId}`)
        if (!multiNode) return new SlotPath(`${weekId} ${dayId}`)
        // multi d'heures sur le même jour : prendre la première heure triée
        const firstHour = multiNode.value
            .map(b => b.value[0])
            .sort((a, b) => (weight[a] ?? 0) - (weight[b] ?? 0))[0]
        return new SlotPath(`${weekId} ${dayId} ${firstHour}`)
    }
    // multi de jours (avec ou sans heure) : prendre le premier item trié par (jour, heure)
    const items = multiNode.value
        .map(b => ({
            day:  b.value.find(v => getSlotIdLevel(v) === 3),
            hour: b.value.find(v => getSlotIdLevel(v) === 4),
        }))
        .sort((a, b) => {
            const d = (weight[a.day] ?? 0) - (weight[b.day] ?? 0)
            return d !== 0 ? d : (weight[a.hour] ?? 0) - (weight[b.hour] ?? 0)
        })
    return slotPathFromItem(weekId, items[0])
}

function slotPathFromItem(weekId, item) {
    return item.hour
        ? new SlotPath(`${weekId} ${item.day} ${item.hour}`)
        : new SlotPath(`${weekId} ${item.day}`)
}
