import { useState } from "react";
import { useSelector } from "react-redux";
import { Button, CircularProgress } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

import TaskDialog from "./task-dialog";
import { useAddTaskMutation, useGetTasksQuery } from "../features/apiSlice";

export default function CreateTask() {

    const [visible, setVisible] = useState(false)
    const [ addTask, { isLoading: isSaving } ] = useAddTaskMutation()
    const userId   = useSelector(state => state.tasks.user.id);
    const activity = useSelector(state => state.tasks.currentActivity);
    const { data:tasks } = useGetTasksQuery({userId, activity});

    const onTaskDialogConfirm = async (task) => {
        const order = task.order ? task.order : ((tasks?.length ?? 0) + 1);
        try {
            await addTask({title:task.title, slotExpr:task.slotExpr, activity: task.activity, status:task.status, order:order, user: userId,
                favorite: task.favorite, url: task.url, nextAction: task.nextAction
            }).unwrap()
            setVisible(false)
        } catch (err) {
            console.error('Échec de la création de la tâche :', err)
        }
    }

    return <>
        <Button variant="contained" startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <AddIcon/>}
            disabled={isSaving}
            onClick={() => setVisible(true)}>Créer Tâche ...</Button>
        { visible && <TaskDialog task={{status:"A faire"}} onCancel={() => {setVisible(false)}} onConfirm={onTaskDialogConfirm}/>}
    </>
}