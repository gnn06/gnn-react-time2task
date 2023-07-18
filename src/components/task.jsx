import React from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";

import './task.css'
import { selectTask } from "../features/taskSlice";

export default function Task({task}) {
    
    const [selected, setSelected] = useState(false);
    const dispatch = useDispatch();

    const myClassName = 'rounded p-1 my-1 '
        + (selected ? 
           'hover:bg-gray-300  bg-gray-400  border-gray-500 border-2'
         : 'hover:bg-green-100 bg-green-200 border-gray-500 border-2');

    const onTaskClick = e => {
        const taskId = task.id;
        setSelected(!selected);
        dispatch(
            selectTask(taskId)
        );
    }

    return <div 
        className={myClassName}
        onClick={onTaskClick}>{task.title}</div>;
}