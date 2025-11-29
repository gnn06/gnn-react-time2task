import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconButton } from "@mui/material";
import TargetIcon from '@mui/icons-material/AdsClick';
import {useDroppable} from '@dnd-kit/core';

import './slot.css';
import SlotTitle from "./slot-title";
import CollapseButton from "./collapse-button";
import { selectSlot, setFilterSlot } from "../features/taskSlice";

import { SortedTaskList } from "./sorted-task-list";
import { findTaskBySlotExpr } from "../data/task";
import { SlotPath } from "../data/slot-path";

export default function Slot({slot, tasks}) {
    const dispatch = useDispatch();
    const selectedTaskLst = useSelector(state => state.tasks.selectedTaskId)
    const selected = useSelector(state => state.tasks.selectedSlotId).some(slotId => slotId === id);
    const filterPath = useSelector(state => state.tasks.currentFilter.slot);
    const filterExpr = useSelector(state => state.tasks.currentFilter.expression);
    const slotStrict = useSelector(state => state.tasks.slotViewFilterConf.slotStrict);
    const { isOver, setNodeRef: setNodeRefDrop, active } = useDroppable({ id: slot.path })
    const showRepeat = useSelector(state => state.tasks.showRepeat);
    
    const { id, start, end, inner } = slot;
    
    let tasksInSlot = [];
    if (!filterPath || filterExpr) {
        tasksInSlot = findTaskBySlotExpr(tasks, slot, showRepeat);
    } else if (slotStrict) {
        if (new SlotPath(slot.path).equalsOrInclude(new SlotPath(filterPath))) {
            tasksInSlot = findTaskBySlotExpr(tasks, slot, showRepeat);
        } else {
            // nothing
        }
    } else {
        tasksInSlot = findTaskBySlotExpr(tasks, slot, showRepeat);
    }

    // need to reorder tasks byb order because task order is affected by multi slots
    tasksInSlot = tasksInSlot.sort((a, b) => {
        if (a.order < b.order) {
            return -1;
        } else if (a.order > b.order) {
            return 1;
        } else {
            return 0;
        }});
    
    const onSlotClick = e => {
        const slotId = slot.id;
        dispatch(
            selectSlot(slotId)
        );
    }
    let slotStyle = "border-2 border-gray-500 rounded p-1 m-0 mr-1 ";
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
    const targetClassName = (isTargetVisible ? "visible" : ( active !== null ? "invisible" : "invisible group-hover:visible"))

    const tmpPath = filterPath || "this_month this_week"

    const dropProps = { 
        ref: setNodeRefDrop, 
        className: " flex flex-row "
                    + (isOver ? "bg-blue-500" : "") + " "
                    + ((active !== null || slot.path === tmpPath) ? "visible" : "invisible group-hover:visible")
    }
    const level = new SlotPath(slot.path).getLevel();

    return <React.Fragment>        
            <div className={"group " + slotStyle}>
                <div className="flex flex-row">
                    <SlotTitle  slot={slot}/>
                    <IconButton className={targetClassName} onClick={onSlot}><TargetIcon /></IconButton>
                    <CollapseButton slot={slot}/>
                </div>
                
                {start != null && end != null && <div className="time text-xs">{start} - {end}</div>}
                <SortedTaskList tasks={tasksInSlot}/>
                <div {...dropProps}  >
                    <div className="" >
                        { level <= 2 && "Déposer une tâche ici !" }
                        { level > 2  && "Déposer ici !" }
                    </div>
                </div>
            </div>
    </React.Fragment>
}
