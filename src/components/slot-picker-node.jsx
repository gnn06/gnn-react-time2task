import SlotPickerCard from "./slot-picker-card";

import { getSlotIdLevel } from "../data/slot-id";

export default function SlotPickerNode({slot, selectedSlotExprs, onSlotChange}) {
    const { path, inner } = slot;

    const innerClass = 'ml-3' 
        + (getSlotIdLevel(slot.id) === getSlotIdLevel('this_week') ? ' flex flex-row' : '');

    return (
        <div>        
            <SlotPickerCard slot={slot} selectedSlotExprs={selectedSlotExprs} onSlotChange={onSlotChange}/>
            <div className={innerClass}>
                {inner != null && inner.map((innerSlot, index) => 
                <SlotPickerNode key={innerSlot.id} slot={innerSlot} 
                    selectedSlotExprs={selectedSlotExprs}
                    onSlotChange={onSlotChange}
                />)}
            </div>    
        </div>
    )
}
