import React from "react";
import { useDispatch } from "react-redux";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import UniqueIcon from '@mui/icons-material/LooksOneOutlined';
import { IconButton } from "@mui/material";
import Color from 'color';

import './task.css'
import SlotSelectionButton from "./slot-selection-button";
import { editTask } from "../features/taskSlice";
import { useGetActivitiesQuery, useUpdateTaskMutation } from "../features/apiSlice";

import { isTaskUnique } from '../data/task.js'
import { getActivityColor } from "./ui-helper";

export default function TaskLight({task}) {

    const { data } = useGetActivitiesQuery()
    const [ updateTask ] = useUpdateTaskMutation()
    const dispatch = useDispatch()

    const activityBgColor = getActivityColor(task.activity, data) || 'rgb(187 247 208)'
    const activityTextColor = Color(activityBgColor).luminosity() > 0.5 ? 'black' : 'white'

    //const colorTail  = STATUS_LST.find(item => item.value === task.status).colorTail;
    
    const myClassName =   'rounded p-1 my-1  border-gray-500 border-2 flex flex-row';

    const isUnique = isTaskUnique(task)

    const onSlotSelectionConfirm = (slotExpr) => {
        updateTask({id:task.id, slotExpr})
    }

    const handleEditTask = () => {
        dispatch(editTask(task))
    }

    // use style for color styling => avoid using tailwindcss color
    return <div className={myClassName} style={{background: activityBgColor, color: activityTextColor}}>
        <span className="grow">{task.title}</span>
        { isUnique && <UniqueIcon/> }
        <SlotSelectionButton style={{background: activityBgColor, color: activityTextColor}} task={task} handleSave={onSlotSelectionConfirm} />
        <IconButton style={{background: activityBgColor, color: activityTextColor}} onClick={handleEditTask}><MoreHorizIcon  /></IconButton>
    </div>;
}