import moment from "moment"
import { ANCHOR_IDS_BY_LEVEL, getSlotIdLevel, isAnchor, weight } from "./slot-id"
import { getNow } from "../utils/now"

export function getDefaultDates() {
    const now        = moment(getNow())
    const startWeek  = now.clone().startOf('isoWeek').format("YYYY-MM-DD")
    const startMonth = now.clone().startOf('month').format("YYYY-MM")
    const today      = now.format("YYYY-MM-DD")
    return [
        { slotid:"this_month", date: startMonth },
        { slotid:"this_week",  date: startWeek },
        { slotid:"today",      date: today },
    ]
}

export function getDefaultDate(levelID) {
    return getDefaultDates().find(el => el.slotid === levelID).date
}

export function getISODate(date) {
    return date.toISOString().substring(0,10)
}

export function getSnapDateToShow(levelID, snapDates) {
    if (snapDates === undefined) return ""
    const level = getSlotIdLevel(levelID)
    const result = snapDates.find(el => getSlotIdLevel(el.slotid) === getSlotIdLevel(levelID))
    const snapDate = result && getDateString(new Date(result.date), level)
    return (snapDate || "")
}

export function getSnapSlotId(levelID) {
    const level = getSlotIdLevel(levelID);
    return ANCHOR_IDS_BY_LEVEL[level.toString()][0];
}

export function getSnapDateToSave(levelID, snapDate) {
    const snapSlotID = getSnapSlotId(levelID);
    let result
    if (snapDate === "") {
        result = getDefaultDate(snapSlotID)
    } else {
        result = shiftDate(snapDate, levelID)
    }
    return result
}


/**
 * 
 * @param {string} date "YYYY-MM-DD" or "YYYY-MM" (not "")
 * @param {string level} level "month" | "week"
 * @returns string ("YYYY-MM-DD" or "YYYY-MM")
 */
export function shiftDate(date, level) {
    if (date === "") return ""
    if (level === "month") {
        const pivotDate = moment(date)
        pivotDate.add(1,'months')
        date = pivotDate.format("YYYY-MM")
    }
    if (level === "week") {
        const pivotDate = moment(date)
        pivotDate.add(7,'days')
        date = pivotDate.format("YYYY-MM-DD")
    }
    if (level === "day") {
        const pivotDate = moment(date)
        pivotDate.add(1,'days')
        date = pivotDate.format("YYYY-MM-DD")
    }
    return date
}

/* use in <SlotTitle/> */
export function getDate(slotID, snapDates) {
    const IdRegExp = slotID.id.match(/(\S+) ?\+? ?(\d*)/)
    const id = IdRegExp[1]
    const shift = IdRegExp[2] !== '' ? parseInt(IdRegExp[2]) : 0
    const level = getSlotIdLevel(id)

    // prerequis : snapDate contains all level
    let snapDate = null;

    // compute date from snapDate or default
    if (level === 1) { // month
        snapDate = snapDates.find(el => el.slotid === "this_month")
        if (snapDate === undefined) {
            snapDate = getDefaultDates().find(el => el.slotid === "this_month")
        }
    }
    if (level === 2) { // week
        snapDate = snapDates.find(el => el.slotid === "this_week")
        if (snapDate === undefined) {
            snapDate = getDefaultDates().find(el => el.slotid === "this_week")
        }
    }

    if (level === 1) { // month
        let resultDate = moment(snapDate.date);
        if (id === 'next_month') {
            resultDate.add(1, 'months')
        }
        resultDate.add(shift, 'months')
        return resultDate.format("YYYY-MM")
    }
    if (level === 2) { // week
        let resultDate = moment(snapDate.date);
        if (id === 'next_week') {
            resultDate.add(7, 'days')
        }
        if (id === 'following_week') {
            resultDate.add(14 + 7 * shift, 'days')
        }
        return resultDate.format("YYYY-MM-DD");
    }
    if (level === 3) { // day
        if (isAnchor(id)) {
            // today / tomorrow : ancres relatifPresent
            snapDate = snapDates.find(el => el.slotid === 'today')
            if (!snapDate) snapDate = getDefaultDates().find(el => el.slotid === 'today')
            let resultDate = moment(snapDate.date)
            if (id === 'tomorrow') resultDate.add(1, 'days')
            resultDate.add(shift, 'days')
            return resultDate.format("YYYY-MM-DD")
        } else {
            // lundi..vendredi : compléments relatifParent, offset depuis lundi de la semaine
            snapDate = snapDates.find(el => el.slotid === 'this_week')
            if (!snapDate) snapDate = getDefaultDates().find(el => el.slotid === 'this_week')
            const offset = weight[id] - 1  // lundi=0, mardi=1, …, vendredi=4
            return moment(snapDate.date).add(offset, 'days').format("YYYY-MM-DD")
        }
    }
    return ""
}

// Jour de la semaine (lundi..dimanche) du `today` STOCKÉ, dérivé des snapDates — et non
// de l'horloge système. Cohérent avec les colonnes weekday (offset depuis le lundi de
// this_week). Sert à aligner la section rollingDays du tree. null si today tombe hors de
// la semaine (snapDates incohérents) → la cellule bascule en colonne overflow.
const WEEKDAY_BY_OFFSET = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
export function getCurrentWeekdayId(snapDates = []) {
    const todayDate = moment(getDate({ id: 'today' }, snapDates))
    const weekSnap = snapDates.find(el => el.slotid === 'this_week')
        ?? getDefaultDates().find(el => el.slotid === 'this_week')
    const offset = todayDate.diff(moment(weekSnap.date), 'days')
    return (offset >= 0 && offset <= 6) ? WEEKDAY_BY_OFFSET[offset] : null
}

export function getDateString(date, level) {
    if (level === 1) { // month
        return moment(date).format("YYYY-MM")
    } else if (level === 2) { // week
        return getISODate(date)
    } else if (level === 3) { // day
        return getISODate(date)
    } else return ""
}