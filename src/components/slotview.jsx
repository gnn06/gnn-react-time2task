import Slot from './slot';
import { slotViewFilter } from "../data/slot-view";

export default function SlotView({tasks, conf})  {
    const slots = slotViewFilter(conf)
    return slots.map((slot, index) => {
        return <Slot key={slot.id} slot={slot} tasks={tasks} />
    })
}