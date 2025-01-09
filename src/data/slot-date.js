import moment from "moment"
import { getSlotIdFirstLevel, getSlotIdLevel } from "./slot-id"

export function getDefaultDates() {
    const startWeek  = moment().startOf('isoWeek').format("YYYY-MM-DD")
    const startMonth = moment().startOf('Month').format("YYYY-MM")
    return [{ slotid:"this_month", date: startMonth }, { slotid:"this_week", date: startWeek }]
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

export function getSnapDateToSave(levelID, snapDate) {
    const snapSlotID = getSlotIdFirstLevel(getSlotIdLevel(levelID));
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
    return date
}

/* use in <SlotTitle/> */
export function getDate(slotID, snapDates) {
    // prerequis : snapDate contains all level
    let snapDate = snapDates.find(el => el.slotid === slotID.id)
    

    // compute date from snapDate or default
    if (slotID.id === 'this_month') {
        if (snapDate === undefined) {
            snapDate = getDefaultDates().find(el => el.slotid === "this_month")
        }
        return moment(snapDate.date).format("YYYY-MM")
    }
    if (slotID.id === 'next_month') {
        snapDate = snapDates.find(el => el.slotid === "this_month")
        if (snapDate === undefined) {
            snapDate = getDefaultDates().find(el => el.slotid === "this_month")
        }
        const pivotDate = moment(snapDate.date)
        pivotDate.add(1,'months')
        return pivotDate.format("YYYY-MM")
    }
    if (slotID.id === 'this_week') {
        if (snapDate === undefined) {
            snapDate = getDefaultDates().find(el => el.slotid === "this_week")
        }
        return snapDate.date
    }
    if (slotID.id === 'next_week') {
        snapDate = snapDates.find(el => el.slotid === "this_week")
        if (snapDate === undefined) {
            snapDate = getDefaultDates().find(el => el.slotid === "this_week")
        }
        const pivotDate = new Date(snapDate.date)
        pivotDate.setDate(pivotDate.getDate() + 7)
        return getISODate(pivotDate)
    }
    if (slotID.id === 'following_week') {
        snapDate = snapDates.find(el => el.slotid === "this_week")
        if (snapDate === undefined) {
            snapDate = getDefaultDates().find(el => el.slotid === "this_week")
        }
        const pivotDate = new Date(snapDate.date)
        pivotDate.setDate(pivotDate.getDate() + 14)
        return getISODate(pivotDate)
    }
    // TODO manage slot as "ID + n"
    return ""
}

export function getDateString(date, level) {
    if (level === 1) { // month
        return moment(date).format("YYYY-MM")
    } else if (level === 2) { // week
        return getISODate(date)
    } else return ""
}