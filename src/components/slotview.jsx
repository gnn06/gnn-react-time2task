import { useState } from 'react';

import SlotTree from './slot-tree';
import { slotViewFilter } from "../data/slot-view";

export default function SlotView({ tasks, conf }) {

  const [selection, setSelection] = useState(new Map());

  const handleSelection = (path, val) => {
    if (val.selected) {
      setSelection(new Map(selection.set(path, val)))
    } else {
      selection.delete(path)
      setSelection(new Map(selection))
    }
  }

  const slots = slotViewFilter(conf)

  return <div className="mt-5">
    {slots.map((slot, index) => {
      return <SlotTree key={slot.id} slot={slot} tasks={tasks} selection={selection} handleSelection={handleSelection} />
    })}
  </div>
}