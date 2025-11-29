import React from "react"

import TaskGroup from "./task-group";
import TaskNew from './task-new';
import { useAddTaskMutation, useUpdateTaskMutation } from "../features/apiSlice.js";
import { Box } from "@mui/material";

export default function TaskList({tasks, group, className = ''}) {

    const [ addTask ] = useAddTaskMutation()
    const [ updateTask, /*{ isLoading: isUpdating }*/ ] = useUpdateTaskMutation()

    if (tasks.length === 0) {
        return <Box   display="flex" minHeight="80vh" justifyContent="center"
        alignItems="center">Créer des tâches puis choisissez les crénaux auxquels vous souhaitez les réaliser.</Box>
    }

    return <React.Fragment>
        <table className={"w-full" + className}>
            <thead>
            <tr>
                <th></th>
                <th>Titre</th>
                <th>Activité</th>
                <th>Statut</th>
                <th></th>
                <th></th>
                <th></th>
            </tr>
            </thead>
            <tbody>
                <TaskGroup tasks={tasks} group={group} api={updateTask}/>
                <TaskNew api={addTask}/>
            </tbody>
        </table>
        { `${tasks.length} tâche(s)` }
    </React.Fragment>
}