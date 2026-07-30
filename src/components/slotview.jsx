import { useState } from 'react';

import SlotViewTree from './slotviewtree';
import SlotViewList from './slotviewlist';
import { useGetSnapDatesQuery } from '../features/apiSlice';

export default function SlotView({ className, tasks, conf }) {

  const { data: snapDates } = useGetSnapDatesQuery();
  const [selection, setSelection] = useState(new Map());

  const handleSelection = (path, val) => {
    if (val.selected) {
      setSelection(new Map(selection.set(path, val)))
    } else {
      selection.delete(path)
      setSelection(new Map(selection))
    }
  }

  return (
    <div className={"overflow-y-scroll "} >
      {conf.view === "tree" && <SlotViewTree tasks={tasks} conf={conf} snapDates={snapDates} />}
      {conf.view === "list" && <SlotViewList tasks={tasks} conf={conf} snapDates={snapDates} />}
    </div>
  )

}