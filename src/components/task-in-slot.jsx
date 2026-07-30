import React from "react";
import { useDispatch } from "react-redux";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import UniqueIcon from '@mui/icons-material/LooksOneOutlined';
import FileDownloadOffIcon from '@mui/icons-material/FileDownloadOff';
import PushPinIcon from '@mui/icons-material/PushPin';
import { IconButton } from "@mui/material";
import Color from 'color';

import './task.css'
import SlotSelectionButton from "./slot-selection-button";
import FavoriteToggle from "./favorite-toggle";
import { editTask } from "../features/taskSlice";
import { useGetActivitiesQuery, useUpdateTaskMutation } from "../features/apiSlice";

import { isTaskUnique, taskHasRelatifParentDay } from '../data/task.js'
import { getActivityColor } from "./ui-helper";
import { STATUS_LST } from "./task-status";
import IconButtonLink from "./icon-button-link";

export default function TaskInSlot({task, isImprecise = false}) {

    const { data } = useGetActivitiesQuery()
    const [ updateTask ] = useUpdateTaskMutation()
    const dispatch = useDispatch()

    const activityBgColor = getActivityColor(task.activity, data) || 'rgb(187 247 208)'
    const activityTextColor = Color(activityBgColor).luminosity() > 0.5 ? 'black' : 'white'

    //const colorTail  = STATUS_LST.find(item => item.value === task.status).colorTail;

    const isUnique = isTaskUnique(task)
    const effectiveTask = task.originalSlotExpr ? { ...task, slotExpr: task.originalSlotExpr } : task
    const isFixed = taskHasRelatifParentDay(effectiveTask)

    const onSlotSelectionConfirm = (slotExpr) => {
        updateTask({id:task.id, slotExpr})
    }

    const handleEditTask = () => {
        dispatch(editTask(task))
    }

    const onToggleFavorite = async () => {
        // need to send nextAction and url to avoid clearing them
        updateTask({ id: task.id, favorite: !task.favorite, nextAction: task.nextAction, url: task.url });
    }

    const statusColor  = STATUS_LST.find(item => item.value === task.status)?.color || "";

    // use style for color styling => avoid using tailwindcss color
    return <>
        <div className="rounded p-1 my-1   " style={{background: activityBgColor, color: activityTextColor}}>
            {/* Set the height to prevent changes if the icon is present. */}
            <div className="flex flex-row items-center"  >
                <div className="grow">
                    {task.title}
                    { task.url && <IconButtonLink href={task.url} fontSize="small" color={activityTextColor} /> }
                    </div>
                
                { isFixed     && <PushPinIcon data-testid="fixed-slot-icon" sx={{ fontSize: 16, color: activityTextColor, opacity: 0.6 }} /> }
                { isImprecise && <FileDownloadOffIcon sx={{ fontSize: 18, color: activityTextColor, opacity: 0.6 }} /> }
                <FavoriteToggle favorite={task.favorite} onToggle={onToggleFavorite} size={24} color={activityTextColor} />
            </div>
            <div className="italic">{task.nextAction} </div>
            <div className="flex flex-row items-center"  >
                <div className="grow">
                    <span className="p-1 "  style={{background: statusColor}}>{task.status}</span>
                </div>                
                
                <SlotSelectionButton style={{background: activityBgColor, color: activityTextColor}} task={task} handleSave={onSlotSelectionConfirm} />
                <IconButton style={{background: activityBgColor, color: activityTextColor}} onClick={handleEditTask}><MoreHorizIcon  /></IconButton>
            </div>            
        </div>
    </>;
}