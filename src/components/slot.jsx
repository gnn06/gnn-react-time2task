import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, IconButton } from "@mui/material";
import TargetIcon from '@mui/icons-material/AdsClick';
import AddIcon from '@mui/icons-material/Add';

import './slot.css';

import SlotTitle from "./slot-title";
import TaskLight from "./task-light";

import { selectSlot, setFilterSlot } from "../features/taskSlice";
import { findTaskBySlotExpr } from "../data/task";
import CollapseButton from "./collapse-button";
import { filter } from "lodash";

export default function Slot({slot, tasks}) {
    const dispatch = useDispatch();
    const selectedTaskLst = useSelector(state => state.tasks.selectedTaskId)
    const selected = useSelector(state => state.tasks.selectedSlotId).some(slotId => slotId === id);
    const filterPath = useSelector(state => state.tasks.currentFilter.slot);

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
        if (slot.path === filterPath) {
            dispatch(setFilterSlot(""));
        } else {
            dispatch(setFilterSlot(slot.path));
        }
    }

    const isTargetVisible = slot.path === filterPath
    const targetClassName = isTargetVisible ? "" : "invisible group-hover:visible"

    const onAddTask = () => {
        const taskId = selectedTaskLst[0]
        console.log("addTask", taskId, slot.path)
    }

    return <React.Fragment>
        <div className={"group " + slotStyle}>
            <div className="flex flex-row">
                <SlotTitle  slot={slot}/>
                <IconButton className={targetClassName} color="primary" onClick={onSlot}><TargetIcon /></IconButton>
                <CollapseButton slot={slot}/>
            </div>
            
            {start != null && end != null && <div className="time text-xs">{start} - {end}</div>}
            { tasksInSlot.length > 0 && tasksInSlot.map(task => <TaskLight key={task.id} task={task} />)}
            <div className="h-10 flex flex-row invisible group-hover:visible">
                
                <Button variant="text" color="primary" startIcon={<AddIcon />} onClick={onAddTask}>Tâche</Button>
            </div>
        </div>
        </React.Fragment>
}
