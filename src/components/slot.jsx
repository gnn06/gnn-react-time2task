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
import { slotHasImpreciseIcon } from "../data/slot-view";
import { getDate } from "../data/slot-date";
import { useGetSnapDatesQuery } from "../features/apiSlice";

export default function Slot({slot, tasks}) {
    const dispatch = useDispatch();
    const selectedTaskLst = useSelector(state => state.tasks.selectedTaskId)
    const selected = useSelector(state => state.tasks.selectedSlotId).some(slotId => slotId === (slot?.id));
    const filterPaths = useSelector(state => state.tasks.currentFilter.slots);
    const filterExpr = useSelector(state => state.tasks.currentFilter.expression);
    const slotStrict = useSelector(state => state.tasks.slotViewFilterConf.slotStrict);
    const showRepeat = useSelector(state => state.tasks.slotViewFilterConf.showRepeat);
    const { data: snapDates, isSuccess: snapDatesReady } = useGetSnapDatesQuery();
    const { isOver, setNodeRef: setNodeRefDrop, active } = useDroppable({ id: slot?.path ?? "" })

    if (!slot) return null;

    const { id, start, end, inner } = slot;
    
    let tasksInSlot = [];
    if (!filterPaths?.length || filterExpr) {
        tasksInSlot = findTaskBySlotExpr(tasks, slot, showRepeat);
    } else if (slotStrict) {
        if (filterPaths.some(fp => new SlotPath(slot.path).equalsOrInclude(new SlotPath(fp)))) {
            tasksInSlot = findTaskBySlotExpr(tasks, slot, showRepeat);
        }
        // else nothing
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
    let slotStyle = "rounded p-1 m-0 mr-1 ";
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

    const isTargetVisible = filterPaths?.includes(slot.path)
    const targetClassName = (isTargetVisible ? "visible" : ( active !== null ? "invisible" : "invisible group-hover:visible"))

    const tmpPath = filterPaths?.[0] || "this_month this_week"

    const dropProps = { 
        ref: setNodeRefDrop, 
        className: " flex flex-row "
                    + (isOver ? "bg-blue-500" : "") + " "
                    + ((active !== null || slot.path === tmpPath) ? "visible" : "invisible group-hover:visible")
    }
    const level = new SlotPath(slot.path).getLevel();
    const showImpreciseIcon = slotHasImpreciseIcon(slot.path, level);

    return <React.Fragment>        
            <div className={"group " + slotStyle} data-slot-path={slot.path}>
                <div className="flex flex-row">
                    <SlotTitle slot={slot} date={(snapDatesReady && getDate(slot, snapDates)) || ""}/>
                    <IconButton className={targetClassName} onClick={onSlot}><TargetIcon /></IconButton>
                    <CollapseButton slot={slot}/>
                </div>
                
                {start != null && end != null && <div className="time text-xs">{start} - {end}</div>}
                <SortedTaskList tasks={tasksInSlot} slot={slot} showImpreciseIcon={showImpreciseIcon} />
                <div {...dropProps}  >
                    <div className="" >
                        { level <= 2 && "Déposer une tâche ici !" }
                        { level > 2  && "Déposer ici !" }
                    </div>
                </div>
            </div>
    </React.Fragment>
}
