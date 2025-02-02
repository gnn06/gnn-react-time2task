import React from "react";
import { useDispatch, useSelector } from "react-redux";

import './slot.css';

import SlotTitle from "./slot-title";
import TaskLight from "./task-light";

import { selectSlot } from "../features/taskSlice";
import { findTaskBySlotExpr } from "../data/task";
import CollapseButton from "./collapse-button";

export default function Slot({slot, tasks}) {
    const dispatch = useDispatch();
    const selected = useSelector(state => state.tasks.selectedSlotId).some(slotId => slotId === id);
    const { id, start, end, inner } = slot;
    const tasksInSlot = findTaskBySlotExpr(tasks, slot);
    const onSlotClick = e => {
        const slotId = slot.id;
        dispatch(
            selectSlot(slotId)
        );
    }
    let slotStyle = "border-2 border-gray-500 rounded p-1 m-0 mt-1 mr-1 ";
    if (selected) {
        slotStyle += "bg-gray-400 ";
    } else {
        slotStyle += "bg-blue-200 ";
    }
    if (selected) {
        slotStyle += "hover:bg-gray-300 ";
    } else {
        slotStyle += "hover:bg-blue-100 ";
    }

    return <React.Fragment>
        <div className={slotStyle}>
            <div className="flex flex-row">
                <SlotTitle  slot={slot}/>
                <CollapseButton slot={slot}/>
            </div>
            
            {start != null && end != null && <div className="time text-xs">{start} - {end}</div>}
            { tasksInSlot.length > 0 && tasksInSlot.map(task => <TaskLight key={task.id} task={task} />)}
            <div className="h-10"/>
        </div>
        </React.Fragment>
}
