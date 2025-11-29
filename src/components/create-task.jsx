import React, { useState } from "react";
import { useSelector, useStore } from "react-redux";
import { Button } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

import TaskDialog from "./task-dialog";
import { useAddTaskMutation, useGetTasksQuery } from "../features/apiSlice";

export default function CreateTask() {
    
    const [visible, setVisible] = useState(false)
    const [ addTask ] = useAddTaskMutation()
    const store = useStore();
    const userId   = useSelector(state => state.tasks.user.id);
    const activity = useSelector(state => state.tasks.currentActivity);
    const { data:tasks } = useGetTasksQuery({userId, activity});

    const onTaskDialogConfirm = (task) => {
        const user = store.getState().tasks.user;
        const order = task.order ? task.order : (tasks.length + 1);
        addTask({title:task.title, slotExpr:task.slotExpr, activity: task.activity, status:task.status, order:order, user: user.id})
        setVisible(false)
    }

    return <React.Fragment>
        <Button variant="contained" size="small" startIcon={<AddIcon/>} 
            onClick={() => setVisible(true)}>Créer Tâche ...</Button>
        { visible && <TaskDialog task={{status:"A faire"}} onCancel={() => {setVisible(false)}} onConfirm={onTaskDialogConfirm}/>}
    </React.Fragment>
}