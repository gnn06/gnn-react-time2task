import React from "react";
import { useDispatch } from "react-redux";
import { useSetSlotExprMutation, useDeleteTaskMutation } from "../features/apiSlice.js";
import { useSelector } from "react-redux";

import './task.css'
import { selectTask } from "../features/taskSlice";

import Button from '../components/button';

export default function Task({task}) {
    
    const selected = useSelector(state => state.tasks.selectedTaskId).some(taskId => taskId === task.id);
    const dispatch = useDispatch();
    const [
        setSlotExpr, // This is the mutation trigger
        { isLoading: isUpdating }, // This is the destructured mutation result
      ] = useSetSlotExprMutation()
    
    const [ deleteTask ] = useDeleteTaskMutation()

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
        setSlotExpr({id:taskId, slotExpr})
    };

    const onClickInput = e => {
        e.stopPropagation();
    };

    const onDeleteClick = e => {
        deleteTask(task.id)
        e.stopPropagation();
    }

    return <tr className={myClassName} onClick={onTaskClick}>
            <td>{task.title} </td>
            <td><input className="p-1 bg-transparent" type="text" defaultValue={task.slotExpr} 
            onBlur={onSlotExprChange} onClick={onClickInput}/></td>
            <td><Button label="Delete" clickToto={onDeleteClick} /></td>
        </tr>;
}