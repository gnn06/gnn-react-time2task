import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconButton } from "@mui/material";
import TargetIcon from '@mui/icons-material/AdsClick';

import './slot.css';

import SlotTitle from "./slot-title";
import TaskLight from "./task-light";

import { selectSlot, setFilterSlot } from "../features/taskSlice";
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
    const onSlot = (event) => {
        dispatch(setFilterSlot(slot.path));
    }

    return <React.Fragment>
        <div className={"group " + slotStyle}>
            <div className="flex flex-row">
                <SlotTitle  slot={slot}/>
                <CollapseButton slot={slot}/>
            </div>
            
            {start != null && end != null && <div className="time text-xs">{start} - {end}</div>}
            { tasksInSlot.length > 0 && tasksInSlot.map(task => <TaskLight key={task.id} task={task} />)}
            <div className="h-10 flex flex-row-reverse invisible group-hover:visible">
                <IconButton onClick={onSlot}><TargetIcon /></IconButton>
            </div>
        </div>
        </React.Fragment>
}
