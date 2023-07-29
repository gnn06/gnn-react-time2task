import React from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

import './task.css'
import { selectTask, setSlotExpr } from "../features/taskSlice";

export default function Task({task}) {
    
    const selected = useSelector(state => state.tasks.selectedTaskId).some(taskId => taskId === task.id);
    const dispatch = useDispatch();

    const myClassName = 'rounded p-1 my-1 '
        + (selected ? 
           'hover:bg-gray-300  bg-gray-400  border-gray-500 border-2'
         : 'hover:bg-green-100 bg-green-200 border-gray-500 border-2');

    const onTaskClick = e => {
        const taskId = task.id;
        dispatch(
            selectTask(taskId)
        );
    }

    const onSlotExprChange = e => {
        const taskId = task.id;
        const slotExpr = e.target.value;
        dispatch(setSlotExpr({taskId, slotExpr}))
    };

    const onClickInput = e => {
        e.stopPropagation();
    };

    return <div 
    className={myClassName}
        onClick={onTaskClick}>{task.title} <input className="p-1" type="text" value={task.slotExpr} 
        onChange={onSlotExprChange} onClick={onClickInput}/></div>;
}