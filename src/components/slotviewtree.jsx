import SlotTree from './slot-tree';

import { slotViewFilter } from "../data/slot-view";

export default function SlotViewTree({tasks, selection, handleSelection, conf}) {

    const slots = slotViewFilter(conf);

    return slots.map((slot, index) => 
          <SlotTree key={slot.id} slot={slot} tasks={tasks} selection={selection} handleSelection={handleSelection} />
    )
}