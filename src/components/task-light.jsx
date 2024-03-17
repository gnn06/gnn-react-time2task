import React, { useState } from "react";
import Color from 'color';

import './task.css'
import { STATUS_LST } from "./task-status.js";

import TaskDialog from './task-dialog'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

// Needed for tailwindcss
const toto = 'bg-red-200 bg-yellow-200 bg-green-200 bg-teal-200 bg-gray-200 bg-purple-200 bg-fuchsia-200 bg-pink-200';
const titi = 'hover:bg-red-100 hover:bg-yellow-100 hover:bg-green-100 hover:bg-teal-100 hover:bg-gray-100 hover:bg-purple-100 hover:bg-fuchsia-100 hover:bg-pink-100';

export default function TaskLight({task}) {

    const [visible, setVisible] = useState(false)

    const colorTail  = STATUS_LST.find(item => item.value === task.status).colorTail;
    
    const myClassName =   'rounded p-1 my-1 hover:bg-'+colorTail+'-100 bg-'+colorTail+'-200 border-gray-500 border-2 ';

    return <div className={myClassName}>
        {task.title}
        <MoreHorizIcon onClick={() => setVisible(true)}/>
        { visible && <TaskDialog task={task} onClose={() => setVisible(false)}/>}
    </div>;
}