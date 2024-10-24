import { useState } from "react";
import { slotViewFilter } from "../data/slot-view";
import SlotView from "./slotview";

export default function Test() {

    const [initialSelection, setInitialSelection] = useState([ 'this_month this_week jeudi aprem', 'this_month next_week' ])

    const conf = {
        collapse: [
          "this_month next_week",
          "this_month following_week",
          "next_month"
        ],
        remove: [],
        levelMin: null,
        levelMaxIncluded: null
    }

    const handleSelection = (path) => {
        if (initialSelection.indexOf(path) > -1) {
            setInitialSelection(initialSelection.filter(item => item !== path))
        } else {
            setInitialSelection(initialSelection.concat(path))
        }
    }
    
    const slot = slotViewFilter(conf)

    return <div>
        <SlotView tasks={[]} conf={conf} selection={initialSelection} handleSelection={handleSelection}/>
        { initialSelection }
    </div>
}