import React from "react";

import './slot.css';

import SlotTitle from "./slot-title";

import { getSlotIdLevel } from "../data/slot-id";
import { SlotPath } from "../data/slot-path";

export default function SlotPickerCard({slot, selectedSlotExpr, onSlotChange}) {
    const { id, title, path, start, end } = slot;
    const isSelected = selectedSlotExpr === path;
    
    // Utiliser equalsOrInclude pour vérifier si le slot est à l'intérieur du slotExpr
    // Inversé : selectedPath.equalsOrInclude(currentPath) car equalsOrInclude vérifie si this inclut other
    const currentRecursivePath = new SlotPath(path);
    const selectedPath = selectedSlotExpr ? new SlotPath(selectedSlotExpr) : null;
    const isInside = selectedPath ? selectedPath.equalsOrInclude(currentRecursivePath) : false;

    let slotStyle = "border-2 border-gray-500 rounded p-1 m-0 mt-1 mr-1 ";
    if (isSelected) {
        slotStyle += "bg-blue-400 ";
    } else if (isInside) {
        const level = getSlotIdLevel(id);
        if (level > -1) {
            slotStyle += [
                "bg-blue-100",
                "bg-blue-200", 
                "bg-blue-300"
            ][level-1] + " ";
        }
    } else {
        slotStyle += "hover:bg-gray-100 ";
    }

    const onSlotClick = (e) => {
        if (!isSelected) {
            onSlotChange && onSlotChange(path);
        }
    };

    return (
        <div className={slotStyle + " cursor-pointer min-w-[8.5em] min-h-[5.5em]"} onClick={onSlotClick}>
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
