import React from "react";
import { useSelector } from "react-redux";

import './slot.css';
import Task from "./task";

import { findWithSlot } from "./domainDataUtil";

export default function Slot({slot}) {
    const { title, start, end, inner } = slot;
    
    const taskRedux = useSelector(state => state.tasks.tasks);
    const association = useSelector(state => state.tasks.association);
    
    const tasksInSlot = findWithSlot(taskRedux, slot.id, association);
    const hasChild = inner == null;

    let slotStyle = "bg-blue-200 border-2 border-gray-500 rounded p-1 my-1 ";
    if (hasChild) {
        slotStyle += "hover:bg-blue-100 ";
    }

    return (
        <div className={slotStyle}>
        <div className="title">{title}</div>
        {start != null && end != null && <div className="time text-xs">{start} - {end}</div>}
        {inner != null && inner.map((innerSlot, index) => 
            <Slot key={innerSlot.id} slot={innerSlot} />)
        }
        { tasksInSlot.length > 0 && tasksInSlot.map(task => <Task task={task} />)}
        <div className="h-10 hover:bg-blue-100"/>
        </div>
        )
    }