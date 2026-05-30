import { useState } from 'react';

import SlotViewTree from './slotviewtree';
import SlotViewList from './slotviewlist';

export default function SlotView({ className, tasks, conf }) {

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
      {conf.view === "tree" && <SlotViewTree tasks={tasks} conf={conf} />}
      {conf.view === "list" && <SlotViewList tasks={tasks} conf={conf} />}
    </div>
  )

}