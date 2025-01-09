import { getDate } from "../data/slot-date";
import { useGetSnapDatesQuery } from "../features/apiSlice"

export default function SlotTitle({slot}) {
    const { data:snapDates, isSuccess }= useGetSnapDatesQuery()
    // console.log(snapDates)
    const { id, title, start, end, inner } = slot;
    const date = (isSuccess && getDate(slot, snapDates)) || ""
    
    return <div><div className="title">{title} <span className="italic text-sm">{id} {date && "-"} {date}</span></div></div>
}