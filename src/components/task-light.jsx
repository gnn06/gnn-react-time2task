import React, { useState } from "react";

import './task.css'
import { STATUS_LST } from "./task-status.js";
import { isTaskUnique } from '../data/task.js'

import TaskDialog from './task-dialog'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import UniqueIcon from '@mui/icons-material/LooksOneOutlined';
import { useGetActivitiesQuery } from "../features/apiSlice";
import { getActivityColor } from "./ui-helper";
import Color from 'color';

export default function TaskLight({task}) {

    const [visible, setVisible] = useState(false)

    const { data, isLoading, isSuccess } = useGetActivitiesQuery()

    const activityBgColor = getActivityColor(task.activity, data) || 'rgb(187 247 208)'
    const activityTextColor = Color(activityBgColor).luminosity() > 0.5 ? 'black' : 'white'

    //const colorTail  = STATUS_LST.find(item => item.value === task.status).colorTail;
    
    const myClassName =   'rounded p-1 my-1  border-gray-500 border-2 ';

    const isUnique = isTaskUnique(task)

    // use style for color styling => avoid using tailwindcss color
    return <div className={myClassName} style={{background: activityBgColor, color: activityTextColor}}>
        {task.title}
        { isUnique && <UniqueIcon/> }
        <MoreHorizIcon onClick={() => setVisible(true)}/>
        { visible && <TaskDialog task={task} onClose={() => setVisible(false)}/>}
    </div>;
}