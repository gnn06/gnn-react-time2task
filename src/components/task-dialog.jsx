import React, { useState } from "react";

import SyntaxInput from './syntax-input';
import StatusInput from './status-input.jsx'
import InputEdit from "./edit-input.jsx";
import Dialog from '@mui/material/Dialog';

import CloseIcon from '@mui/icons-material/Close';

import { useUpdateTaskMutation } from "../features/apiSlice.js";
import { getExprKeywords } from "../data/slot-path.js";


export default function TaskDialog({task, onClose}) {
    const syntaxKeywords = [ 'lundi', 'mardi' ]

    const [
        updateTask, // This is the mutation trigger
        // eslint-disable-next-line
        { isLoading: isUpdating }, // This is the destructured mutation result
      ] = useUpdateTaskMutation()
      
    const onTitleChange = (e) => {
        const taskId = task.id;
        const title = e.target.value;
        updateTask({id:taskId, title: title})
    };
    
    const onSlotExprChange = e => {
        const taskId = task.id;
        const slotExpr = e;
        updateTask({id:taskId, slotExpr})
    };

    const onOrderChange = event => {
        const taskId = task.id;
        const order = event.target.value === '' ? null : Number(event.target.value);
        updateTask({id:taskId, order})
    };

    const onStatusChange = (value) => {
        const taskId = task.id;
        updateTask({id:taskId, status: value})
    };

    return <div>
        <Dialog onClose={onClose} open={true}  maxWidth="lg">
            <div className="p-3">
                <div className="flex flex-row">
                    <h1 className=" text-lg mb-4 grow">Détail de tâche</h1>
                    <CloseIcon onClick={onClose}/>
                </div>
                <div className="m-5">
                    <InputEdit defaultValue={task.title} saveHandler={onTitleChange} className="w-full"/>
                    <SyntaxInput initialInputValue={task.slotExpr} classNameInput="" items={getExprKeywords()}
                        onInputChange={onSlotExprChange} closeIcon/>
                    <StatusInput task={task} saveHandler={onStatusChange}/>
                    <InputEdit defaultValue={task.order} saveHandler={onOrderChange} className="w-full"/>
                </div>
            </div>
        </Dialog>
        </div>
}