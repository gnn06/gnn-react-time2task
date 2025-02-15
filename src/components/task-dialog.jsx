import React, { useState } from "react";
import {produce} from "immer"

import Dialog from '@mui/material/Dialog';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, InputLabel, Stack, TextField } from "@mui/material";

import StatusInput from './status-input.jsx'

import { useUpdateTaskMutation } from "../features/apiSlice.js";
import { getSlotIdAndKeywords } from "../data/slot-id.js";
import ActivityInput from "./activity-input";
import SyntaxInputWithSelection from "./syntax-input-select";


export default function TaskDialog({task: taskProp, onCancel, onConfirm}) {
    const [task, setTask] = useState(taskProp);

    const [
        updateTask, // This is the mutation trigger
        // eslint-disable-next-line
        { isLoading: isUpdating }, // This is the destructured mutation result
      ] = useUpdateTaskMutation()
      
    const onTitleChange = (e) => {
        // const taskId = task.id;
        const title = e.target.value;
        const newTask = produce(task, draft => { draft.title = title; })
        setTask(newTask)
    };
    
    const onSlotExprChange = e => {
        const slotExpr = e;
        const newTask = produce(task, draft => { draft.slotExpr = slotExpr; })
        setTask(newTask)
    };

    const onOrderChange = event => {
        const order = event.target.value === '' ? null : Number(event.target.value);
        const newTask = produce(task, draft => { draft.order = order; })
        setTask(newTask)
    };

    const onActivityChange = activity => {
        if (activity === '' || activity === null) { activity = null } else { activity = Number(activity) }
        const newTask = produce(task, draft => { draft.activity = activity; })
        setTask(newTask)
    };

    const onStatusChange = (status) => {
        const newTask = produce(task, draft => { draft.status = status; })
        setTask(newTask)
    };

    return <div>
        <Dialog onClose={onCancel} open={true}  maxWidth="md" fullWidth={true}>
            <div className="p-3">
                <div className="flex flex-row">
                    <h1 className=" text-lg mb-4 grow">Détail de tâche</h1>
                    <IconButton size="small" onClick={onCancel}><CloseIcon /></IconButton>
                    
                </div>
                <div className="m-5">
                    <Stack spacing={2}>
                        <InputLabel>#ID : {task.id}</InputLabel>                        
                        <TextField label="Titre de la tâche" value={task.title} onChange={onTitleChange}></TextField>
                        <SyntaxInputWithSelection initialInputValue={task.slotExpr} classNameInput="" items={getSlotIdAndKeywords()}
                        onInputChange={onSlotExprChange} title={task.title} closeIcon placeHolderInput="Les créneaux pour réaliser la tâche"/>
                        <ActivityInput task={task} saveHandler={onActivityChange} isFilter={false} />
                        <StatusInput task={task} saveHandler={onStatusChange}/>
                        <TextField value={task.order} saveHandler={onOrderChange} label="L'ordre de la tâche parmi les autres tâches du créneau (nombre)" />
                        <InputLabel>{ import.meta.env.DEV && JSON.stringify(task)}</InputLabel>
                    </Stack>
                </div>
                <div className='flex flex-row justify-end space-x-1 mt-5'>
                    <Button label="Annuler" clickToto={() => onCancel()} />
                    <Button label="Confirmer" clickToto={() => onConfirm(task)} />
                </div>
            </div>
        </Dialog>
        </div>
}