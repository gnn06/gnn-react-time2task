import SlotSelect from "./slot-select";
import DndContainer from "./dnd-container";

import { isInsideSelected } from "../data/selection-tree";
import { getSlotIdLevel } from "../data/slot-id";

/**
 * affiche réccursivement l'arbre des slots en utilisant SlotSelect.
 * @param {*} param0 
 * @returns 
 */
export default function SlotTreeSelect({slot, selection, handleSelection, handleShift, handleClick, handleRepetition, handleDisable}) {
    const { path, inner } = slot;

    const innerClass = 'ml-3' 
        + (getSlotIdLevel(slot.id) === getSlotIdLevel('this_week') ? ' flex flex-row' : '');

    const selected = selection.get(path) && selection.get(path).selected || false
    const isInside = isInsideSelected(path, selection)

    const mode = (selected || isInside) ? "drag" : "drop";

    return (
        <div>        
            <DndContainer id={slot.path} 
                mode={mode}>
                <SlotSelect slot={slot} selection={selection} handleSelection={handleSelection} handleShift={handleShift} handleClick={handleClick}
                        handleRepetition={handleRepetition} handleDisable={handleDisable}/>
            </DndContainer>
            <div className={innerClass}>
                {inner != null && inner.map((innerSlot, index) => 
                <SlotTreeSelect key={innerSlot.id} slot={innerSlot} 
                    selection={selection}
                    handleSelection={(path, val) => handleSelection && handleSelection(path, val)} 
                    handleShift={handleShift}
                    handleClick={handleClick}
                    handleRepetition={handleRepetition}
                    handleDisable={handleDisable}
                />)}
            </div>    
        </div>
    )
}