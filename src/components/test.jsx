import { slotViewList } from "../data/slot-view";
import SlotViewList from "./slotviewlist";
import SlotTree from "./slot-tree";

export default function Test() {
    const slots = slotViewList();

    const tasks = [
        { id: "task1", title: "Task 1", slotExpr: "this_month this_week mercredi matin", activity: 'activité' },
        { id: "task2", title: "Task 2", slotExpr: "this_month this_week mercredi aprem", activity: 'activité' },
        { id: "task3", title: "Task 3", slotExpr: "this_month this_week mercredi",       activity: 'activité' },
        { id: "task4", title: "Task 4", slotExpr: "this_month this_week jeudi",          activity: 'activité' },
        { id: "task5", title: "This Week", slotExpr: "this_month this_week",             activity: 'activité' }
    ];

    return <div >
        <SlotViewList slot={slots} tasks={tasks} />
    </div>
}