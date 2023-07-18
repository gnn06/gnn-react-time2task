import React from "react";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useDispatch } from "react-redux";

import './slot.css';
import Task from "./task";

import { findWithSlot } from "./domainDataUtil";
import { selectSlot } from "../features/taskSlice";

export default function Slot({slot}) {
    const dispatch = useDispatch();
    
    const { title, start, end, inner } = slot;
    const [selected, setSelected] = useState(false);

    const taskRedux = useSelector(state => state.tasks.tasks);
    const association = useSelector(state => state.tasks.association);
    
    const tasksInSlot = findWithSlot(taskRedux, slot.id, association);

    let slotStyle = "border-2 border-gray-500 rounded p-1 my-1 ";
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

    const onSlotClick = e => {
        setSelected(!selected);
        const slotId = slot.id;
        dispatch(
            selectSlot(slotId)
        );
    }

    return (
        <div>
            <div className={slotStyle} onClick={onSlotClick}>
                <div className="title">{title}</div>
                {start != null && end != null && <div className="time text-xs">{start} - {end}</div>}
                { tasksInSlot.length > 0 && tasksInSlot.map(task => <Task task={task} />)}
                <div className="h-10"/>
            </div>
            <div className="mx-3">
                {inner != null && inner.map((innerSlot, index) => 
                <Slot key={innerSlot.id} slot={innerSlot} />)}
            </div>
        </div>
        )
    }