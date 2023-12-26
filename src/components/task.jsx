import React from "react";
import { useDispatch } from "react-redux";
import { useSetSlotExprMutation, useSetOrderMutation, useDeleteTaskMutation } from "../features/apiSlice.js";
import { useSelector } from "react-redux";

import './task.css'
import { selectTask } from "../features/taskSlice";
import { slotIdList } from "../services/slot.js";

import Button from '../components/button';
import SyntaxInput from './syntax-input';
import StatusInput from './status-input.jsx'

export default function Task({task}) {
    
    const selected = useSelector(state => state.tasks.selectedTaskId).some(taskId => taskId === task.id);
    const dispatch = useDispatch();
    const [
        setSlotExpr, // This is the mutation trigger
        // eslint-disable-next-line
        { isLoading: isUpdating }, // This is the destructured mutation result
      ] = useSetSlotExprMutation()
      const [
        setOrder, // This is the mutation trigger
      ] = useSetOrderMutation()
    
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
        const slotExpr = e;
        setSlotExpr({id:taskId, slotExpr})
    };

    const onOrderChange = e => {
        const taskId = task.id;
        const order = e.target.value;
        setOrder({id:taskId, order})
    };

    const onDeleteClick = e => {
        // TODO add confirmation
        deleteTask(task.id)
        e.stopPropagation();
    }

    const noPropagation = (e) => {
        e.stopPropagation();
    }

    return <tr className={myClassName} >
            <td>{task.title} </td>
            <td>                
                <SyntaxInput initialInputValue={task.slotExpr} classNameInput="bg-transparent" items={slotIdList}
                    onInputChange={onSlotExprChange}/>
            </td>
            <td><input defaultValue={task.order} onChange={onOrderChange} onClick={noPropagation} 
                className="bg-transparent w-10"/></td>
            <td><StatusInput task={task}/></td>
            <td><Button label="Delete" clickToto={onDeleteClick} /></td>
        </tr>;
}