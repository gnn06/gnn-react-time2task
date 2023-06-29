import React from "react";
import { useSelector } from "react-redux";

import './slot.css';
import Task from "./task";

export default function Slot({slot}) {
    const { title, start, end, inner } = slot;
    const taskRedux = useSelector(state => state.tasks);
    const tasksInSlot = taskRedux.filter(task => task.slotId != null && task.slotId === slot.id);
    return (
        <div className="bg-blue-200 border-2 border-gray-500 rounded p-1 my-1">
        <div className="title">{title}</div>
        {start != null && end != null && <div className="time text-xs">{start} - {end}</div>}
        {inner != null && inner.map((innerSlot, index) => 
            <Slot key={innerSlot.id} slot={innerSlot} />)
        }
        { tasksInSlot.length > 0 && tasksInSlot.map(task => <Task task={task} />)}
        <div className="h-10"/>
        </div>
        )
    }