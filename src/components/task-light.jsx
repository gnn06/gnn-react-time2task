import React, { useState } from "react";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import UniqueIcon from '@mui/icons-material/LooksOneOutlined';
import { IconButton } from "@mui/material";
import Color from 'color';

import './task.css'
import { STATUS_LST } from "./task-status.js";
import { isTaskUnique } from '../data/task.js'

import TaskDialog from './task-dialog'
import { useGetActivitiesQuery, useUpdateTaskMutation } from "../features/apiSlice";
import { getActivityColor } from "./ui-helper";
import SlotSelectionButton from "./slot-selection-button";

export default function TaskLight({task}) {

    const [visible, setVisible] = useState(false)

    const { data } = useGetActivitiesQuery()
    const [ updateTask ] = useUpdateTaskMutation()

    const activityBgColor = getActivityColor(task.activity, data) || 'rgb(187 247 208)'
    const activityTextColor = Color(activityBgColor).luminosity() > 0.5 ? 'black' : 'white'

    //const colorTail  = STATUS_LST.find(item => item.value === task.status).colorTail;
    
    const myClassName =   'rounded p-1 my-1  border-gray-500 border-2 flex flex-row';

    const isUnique = isTaskUnique(task)

    const onSlotSelectionConfirm = (slotExpr) => {
        updateTask({id:task.id, slotExpr})
    }

    const onTaskDialogConfirm = (task) => {
        updateTask({id:task.id, title:task.title, slotExpr:task.slotExpr, activity: task.activity, status:task.status, order:task.order})
        setVisible(false)
    }

    // use style for color styling => avoid using tailwindcss color
    return <div className={myClassName} style={{background: activityBgColor, color: activityTextColor}}>
        <span className="grow">{task.title}</span>
        { isUnique && <UniqueIcon/> }
        <SlotSelectionButton style={{background: activityBgColor, color: activityTextColor}} task={task} handleSave={onSlotSelectionConfirm}/>
        <IconButton style={{background: activityBgColor, color: activityTextColor}}><MoreHorizIcon  onClick={() => setVisible(true)}/></IconButton>
        { visible && <TaskDialog task={task} onCancel={() => setVisible(false)} onConfirm={onTaskDialogConfirm}/>}
    </div>;
}