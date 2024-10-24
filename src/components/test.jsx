import { slotViewFilter } from "../data/slot-view";
import SlotList from "./slotlist";

export default function Test() {

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

    const slot = slotViewFilter(conf)
    
    return <div>
        <SlotList tasks={[]}/>
    </div>
}