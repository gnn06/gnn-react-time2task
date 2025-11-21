import Xarrow from "react-xarrows";
import SlotViewList from "./slotviewlist";
import Slot from "./slot";

export default function Test() {
    const tasks = [
        { id: "task1", title: "Task 1", slotExpr: "this_month this_week mercredi matin", activity: 'activité' },
        { id: "task2", title: "Task 2", slotExpr: "this_month this_week mercredi aprem", activity: 'activité' },
        { id: "task3", title: "Task 3", slotExpr: "this_month this_week mercredi",       activity: 'activité' },
        { id: "task4", title: "Task 4", slotExpr: "this_month this_week jeudi",          activity: 'activité' },
        { id: "task5", title: "This Week", slotExpr: "this_month this_week",             activity: 'activité' }
    ];

    const slots = [];
    slots.push([{ id:'matin', path:'this_month this_week mercredi matin', inner:[] },
                { id:'aprem', path:'this_month this_week mercredi aprem', inner:[] }]);
    slots.push([{ id:'mardi', path:'this_month this_week mardi', inner:[] },
                { id:'mercredi', path:'this_month this_week mercredi', inner:slots[0] },
                { id:'jeudi', path:'this_month this_week jeudi', inner:[] }]);
    slots.push([{ id:'this_week', path:'this_month this_week', inner:slots[1] },
                { id:'next_week', path:'this_month next_week', inner:[] }]);
    slots.push([{ id:'this_month', path:'this_month', inner:slots[2] },
                { id:'next_month', path:'next_month', inner:[] }]);

    function SlotArcher ({slot, tasks}) {
        return <div id={slot.id} className="inline-block">
            <Slot slot={slot} tasks={tasks} />
            {slot.inner.map(innerSlot => <Xarrow start={slot.id} end={innerSlot.id} path="grid" startAnchor="top" endAnchor="bottom" />)}
        </div>;
    }
            
    function Row ({slots}) {
        return <div className="m-20">
            { slots.length === 3 ? <SlotArcher slot={slots[0]} tasks={tasks} /> : <div></div> }
            <SlotArcher slot={slots[slots.length-2]} tasks={tasks} />
            <SlotArcher slot={slots[slots.length-1]} tasks={tasks} />
        </div>;
    }
   
    function Temp() {
        return <div>
            <Row slots={slots[0]}></Row>
            <Row slots={slots[1]}></Row>
            <Row slots={slots[2]}></Row>
        </div>
    }

    return <SlotViewList tasks={tasks} />;
    
}