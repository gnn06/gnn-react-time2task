export default function SlotTitle({slot, date = ""}) {
    const { id, title } = slot;
    return <div className="flex-auto"><div className="title ">{title} <span className="italic text-sm">{id} {date && "-"} {date}</span></div></div>
}