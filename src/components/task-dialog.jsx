import { useState } from "react";
import { produce } from "immer"

import { InputLabel, Stack, TextField } from "@mui/material";
import FavoriteToggle from "./favorite-toggle.jsx";

import StatusInput from './status-input.jsx'
import ActivityInput from "./activity-input";
import SyntaxInputWithSelection from "./syntax-input-select";
import Confirm from "./Confirm.jsx";
import SlotSelectionButton from "./slot-selection-button.jsx";
import IconButtonLink from "./icon-button-link.jsx";

import { getSlotIdAndKeywords } from "../data/slot-id.js";

/**
 * Permet l'éditin d'une tache et fournit la tache modifiée via callback
 * @param {*} param0 
 * @returns 
 */
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

function Content({task, setTask}) {
    
    const onTitleChange = (e) => {
        // const taskId = task.id;
        const title = e.target.value;
        const newTask = produce(task, draft => { draft.title = title; })
        setTask(newTask)
    };

    const onNextActionChange = (e) => {
        const newNextAcion = e.target.value;
        const newTask = produce(task, draft => { draft.nextAction = newNextAcion; })
        setTask(newTask)
    };

    const onUrlChange = (e) => {
        const newUrl = e.target.value;
        const newTask = produce(task, draft => { draft.url = newUrl; })
        setTask(newTask)
    };
    
    const onSlotExprChange = e => {
        const slotExpr = e;
        const newTask = produce(task, draft => { draft.slotExpr = slotExpr; })
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

    const onFavoriteToggle = () => {
        const newTask = produce(task, draft => { draft.favorite = !draft.favorite; })
        setTask(newTask)
    };

    return <Stack spacing={2} className="h-[65vh]" > 
        <InputLabel>#ID : {task.id}</InputLabel>                        
        <Stack direction="row" spacing={1} sx={{ width: '100%', alignItems: 'center' }} >
            <TextField label="Titre de la tâche" value={task.title} onChange={onTitleChange} fullWidth/>
            <FavoriteToggle favorite={task.favorite} onToggle={onFavoriteToggle} size={40} />
        </Stack>
        <TextField label="Première action à réaliser" value={task.nextAction || ''} onChange={onNextActionChange} fullWidth/>
        <Stack direction="row" spacing={1}>
            <TextField label="Lien" value={task.url || ''} onChange={onUrlChange} fullWidth />
            <IconButtonLink href={task.url} fontSize="large" />
        </Stack>
        <Stack direction={"row"} spacing={1} >
            <SyntaxInputWithSelection key={task.slotExpr} initialInputValue={task.slotExpr} classNameInput="" items={getSlotIdAndKeywords()}
            onInputChange={onSlotExprChange} title={task.title} closeIcon placeHolderInput="Les créneaux pour réaliser la tâche"/>
            <SlotSelectionButton  task={task} handleSave={onSlotExprChange} withText={true} />
        </Stack>
        <ActivityInput activity={task.activity} saveHandler={onActivityChange} isFilter={false} />
        <StatusInput task={task} saveHandler={onStatusChange}/>
        <InputLabel>{ import.meta.env.DEV && JSON.stringify(task)}</InputLabel>
    </Stack>
}
