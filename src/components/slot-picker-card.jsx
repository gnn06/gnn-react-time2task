import React from "react";

import './slot.css';

import SlotTitle from "./slot-title";

export default function SlotPickerCard({slot, selectedSlotExprs, onSlotChange}) {
    const { id, title, path, start, end } = slot;
    const isSelected = selectedSlotExprs?.includes(path);

    // Mêmes fonds que SlotSelect (picker de tâche) : carte grise par défaut,
    // accent bleu saturé pour le créneau sélectionné. Pas d'ancêtre ni de disable ici.
    let slotStyle = "rounded p-1 m-0 mt-1 mr-1 ";
    if (isSelected) {
        slotStyle += "bg-blue-400 hover:bg-blue-300 ";
    } else {
        slotStyle += "bg-gray-100 hover:bg-gray-50 ";
    }

    const onSlotClick = (e) => {
        onSlotChange && onSlotChange(path);
    };

    return (
        <div className={slotStyle + " cursor-pointer min-w-[8.5em] min-h-[5.5em]"} data-slot-path={path} onClick={onSlotClick}>
            <div className="flex flex-row">
                <SlotTitle slot={slot} />
                <div>                    
                    {start != null && end != null && <div className="time text-xs">{start} - {end}</div>}
                </div>            
            </div>
            <div className="h-3"/>
        </div>
    );
}
