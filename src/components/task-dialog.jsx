import React, { useState } from "react";
import {produce} from "immer"

import Dialog from '@mui/material/Dialog';
import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, InputLabel, Stack, TextField } from "@mui/material";

import StatusInput from './status-input.jsx'
import Button from "./button.jsx";

import { useUpdateTaskMutation } from "../features/apiSlice.js";
import { getSlotIdAndKeywords } from "../data/slot-id.js";
import ActivityInput from "./activity-input";
import SyntaxInputWithSelection from "./syntax-input-select";
import Confirm from "./Confirm.jsx";
import SlotSelectionButton from "./slot-selection-button.jsx";

function Content({task, setTask}) {

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

    return <Stack spacing={2} className="h-[65vh]" > 
        <InputLabel>#ID : {task.id}</InputLabel>                        
        <TextField label="Titre de la tâche" value={task.title} onChange={onTitleChange}></TextField>
        <Stack direction={"row"} spacing={1} >
            <SyntaxInputWithSelection key={task.slotExpr} initialInputValue={task.slotExpr} classNameInput="" items={getSlotIdAndKeywords()}
            onInputChange={onSlotExprChange} title={task.title} closeIcon placeHolderInput="Les créneaux pour réaliser la tâche"/>
            <SlotSelectionButton  task={task} handleSave={onSlotExprChange} withText={true} />
        </Stack>
        <ActivityInput task={task} saveHandler={onActivityChange} isFilter={false} />
        <StatusInput task={task} saveHandler={onStatusChange}/>
        <TextField value={(task.order === undefined || task.order === null) ? "" : task.order} onChange={onOrderChange} label="L'ordre de la tâche parmi les autres tâches du créneau (nombre)" 
        sx={{label:{zIndex:0}}} />
        <InputLabel>{ import.meta.env.DEV && JSON.stringify(task)}</InputLabel>
    </Stack>
}

export default function TaskDialog({task: taskProp, onCancel, onConfirm}) {
    const [task, setTask] = useState(taskProp);
    const handleConfirm = () => {
        onConfirm(task)
    }
      
    return <div>
        <Confirm titre="Détail de tâche" handleCancel={onCancel} handleConfirm={handleConfirm}>
            <Content task={task} setTask={setTask}/>
        </Confirm>
        </div>
}