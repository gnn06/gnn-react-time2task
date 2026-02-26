import SlotPickerCard from "./slot-picker-card";

import { getSlotIdLevel } from "../data/slot-id";

export default function SlotPickerNode({slot, selectedSlotExpr, onSlotChange}) {
    const { path, inner } = slot;

    const innerClass = 'ml-3' 
        + (getSlotIdLevel(slot.id) === getSlotIdLevel('this_week') ? ' flex flex-row' : '');

    return (
        <div>        
            <SlotPickerCard slot={slot} selectedSlotExpr={selectedSlotExpr} onSlotChange={onSlotChange}/>
            <div className={innerClass}>
                {inner != null && inner.map((innerSlot, index) => 
                <SlotPickerNode key={innerSlot.id} slot={innerSlot} 
                    selectedSlotExpr={selectedSlotExpr}
                    onSlotChange={onSlotChange}
                />)}
            </div>    
        </div>
    )
}
