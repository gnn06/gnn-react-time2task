import React from "react";
import { useSelector } from "react-redux";
import Slot from './slot';

export default function SlotList()  {
    const slotRedux = useSelector(state => state.slot.slots);
    const taskRedux = useSelector(state => state.task.tasks);
    return (
        <div className="m-1">
        <h1>Slots</h1>
        {slotRedux.map((slot, index) => {
            return <Slot key={slot.id} slot={slot} tasks={taskRedux}/>
        })}
        </div>
        )
    }