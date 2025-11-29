import { Stack } from "@mui/material";
import Xarrow from "react-xarrows";

import { getSlotsForRow, slotViewList } from "../data/slot-view";
import Slot from "./slot";

function getRelations(slots){
        return slots.map(slot => ({
            targetId: slot.id,
            targetAnchor: 'bottom',
            sourceAnchor: 'top',
        }));
    }
export default function SlotViewList({tasks}) {
    const row_spacing = 1;
    const line_spacing = 2.0;

    const slots = slotViewList(null);

    function SlotArcher ({slot, tasks}) {
        return <div id={slot.id} className="h-fit">
            <Slot slot={slot} tasks={tasks} />
            {slot.inner.map((innerSlot,index) => <Xarrow key={index} start={slot.id} end={innerSlot.id} path="grid" startAnchor="top" endAnchor="bottom" 
                                            gridBreak="20" strokeWidth={3}
                                            divContainerStyle={{ position: 'relative' }}/>)}
        </div>;
    }
        
    function Row ({slots}) {
        const tmp = getSlotsForRow(slots);
        return (
            <>
                {tmp.map((slot, idx) =>
                    slot
                        ? <SlotArcher key={slot.id} slot={slot} tasks={tasks} />
                        : <div key={`empty-${idx}`} />
                )}
            </>
        );
    }

    return <div className="inline-grid grid-cols-3 gap-y-10 gap-x-4">
                {slots.map((item, index) =>  
            <Row key={index} slots={item}></Row>
        )}            
    </div>
}