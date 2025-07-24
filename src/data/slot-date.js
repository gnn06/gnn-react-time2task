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