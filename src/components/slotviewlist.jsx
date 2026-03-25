import Slot from "./slot";

import { getSlotsForRow, slotViewList } from "../data/slot-view";
import { GENERIC_SLOTIDS, getSlotIdLevel } from "../data/slot-id";

export default function SlotViewList({tasks}) {
    const row_spacing = 1;
    const line_spacing = 2.0;

    const slots = slotViewList(null);

    function Row ({slots}) {
        const tmp = getSlotsForRow(slots);
        const level = GENERIC_SLOTIDS[getSlotIdLevel(slots[0].id)-1];
        return (
            <>
                <div style={{writingMode: "sideways-lr"}} className="bg-gray-100 text-center">{level}</div>
                {tmp.map((slot, idx) =>
                    slot
                        ? <div key={slot.id} className="p-3 "><Slot  slot={slot} tasks={tasks} /></div>
                        : <div key={`empty-${idx}`} />
                )}
            </>
        );
    }

    // return <div>goi</div>

    return <div className="inline-grid grid-cols-[auto_repeat(3,1fr)] border-none divide-dashed  border-gray-400 divide-gray-400 divide-x divide-y border-e-2 border-b-2 p-0 bg-white">
            <div></div>
            <div className="bg-gray-100 text-center">Past</div>
            <div className="bg-gray-100 text-center">Present</div>
            <div className="bg-gray-100 text-center">Future</div>
            {slots.map((item, index) =>  
                <Row key={index} slots={item}></Row>
            )}            
    </div>
}