import SlotView from "./slotview";

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

    return <div>
        <SlotView tasks={[]} conf={conf} />
    </div>
}