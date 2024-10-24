import Slot from './slot';
import { slotViewFilter } from "../data/slot-view";
import { useState } from 'react';

export default function SlotView({tasks, conf})  {
    const [initialSelection, setInitialSelection] = useState([])
    const handleSelection = (path) => {
        if (initialSelection.indexOf(path) > -1) {
            setInitialSelection(initialSelection.filter(item => item !== path))
        } else {
            setInitialSelection(initialSelection.concat(path))
        }
    }
    
    const slots = slotViewFilter(conf)

    return <div>
        {slots.map((slot, index) => {
            return <Slot key={slot.id} slot={slot} tasks={tasks} selection={initialSelection} handleSelection={handleSelection}/>
        })}
        { initialSelection }
    </div>
}