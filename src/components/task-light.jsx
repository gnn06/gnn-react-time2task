import React, { useState } from "react";
import EditIcon from '@mui/icons-material/Edit';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import UniqueIcon from '@mui/icons-material/LooksOneOutlined';
import { IconButton } from "@mui/material";
import Color from 'color';

import './task.css'
import { STATUS_LST } from "./task-status.js";
import { isTaskUnique } from '../data/task.js'

import TaskDialog from './task-dialog'
import SlotViewSelect from "./slot-view-select";
import { useGetActivitiesQuery, useUpdateTaskMutation } from "../features/apiSlice";
import { getActivityColor } from "./ui-helper";

const classNameIconn = "text-black ml-0.5 text-xs "

const conf = {
    collapse: [
      "this_month next_week",
      "this_month following_week",
      "next_month"
    ],
    remove: [],
    levelMin: null,
    levelMaxIncluded: null
}

export default function TaskLight({task}) {

    const [visible, setVisible] = useState(false)
    const [ showSlotSelect, setShowSlotSelect ] = useState(false)

    const { data, isLoading, isSuccess } = useGetActivitiesQuery()
    const [ updateTask ] = useUpdateTaskMutation()

    const activityBgColor = getActivityColor(task.activity, data) || 'rgb(187 247 208)'
    const activityTextColor = Color(activityBgColor).luminosity() > 0.5 ? 'black' : 'white'

    //const colorTail  = STATUS_LST.find(item => item.value === task.status).colorTail;
    
    const myClassName =   'rounded p-1 my-1  border-gray-500 border-2 ';

    const isUnique = isTaskUnique(task)

    const onSlotSelect = () => {
        setShowSlotSelect(true)
    }

    const onSlotSelectCancel = () => {
        setShowSlotSelect(false)
    }

    const onSlotSelectConfirm = (e) => {
        const taskId = task.id;
        const slotExpr = e;
        updateTask({id:taskId, slotExpr})
    }

    // use style for color styling => avoid using tailwindcss color
    return <div className={myClassName} style={{background: activityBgColor, color: activityTextColor}}>
        {task.title}
        { isUnique && <UniqueIcon/> }
        <IconButton onClick={onSlotSelect}><EditIcon style={{color: activityTextColor}} /></IconButton>
        
        { showSlotSelect && <SlotViewSelect selectionExpr={task.slotExpr} title={task.title} conf={conf} onConfirm={onSlotSelectConfirm} onCancel={onSlotSelectCancel}/>}
        <MoreHorizIcon onClick={() => setVisible(true)}/>
        { visible && <TaskDialog task={task} onClose={() => setVisible(false)}/>}
    </div>;
}