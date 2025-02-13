import React, { useState } from "react";
import { useStore } from "react-redux";
import { Button } from "@mui/material";

import TaskDialog from "./task-dialog";
import { useAddTaskMutation } from "../features/apiSlice";

export default function CreateTask() {
    
    const [visible, setVisible] = useState(false)
    const [ addTask ] = useAddTaskMutation()
    const store = useStore();

    const onTaskDialogConfirm = (task) => {
        const user = store.getState().tasks.user;
        addTask({title:task.title, slotExpr:task.slotExpr, activity: task.activity, status:task.status, order:task.order, user: user.id})
        setVisible(false)
    }

    return <React.Fragment>
        <Button variant="contained" size="small" onClick={() => setVisible(true)}>Créer Tâche</Button>
        { visible && <TaskDialog task={{status:"A faire"}} onCancel={() => {setVisible(false)}} onConfirm={onTaskDialogConfirm}/>}
    </React.Fragment>
}