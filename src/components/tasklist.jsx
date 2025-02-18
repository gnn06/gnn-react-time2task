import { useState } from "react";
import TaskGroup from "../components/task-group";
import TaskNew from './task-new';

import { useAddTaskMutation, useUpdateTaskMutation } from "../features/apiSlice.js";
import ShiftAction from './action-shift';
import TodoAction from './action-todo';
import CreateTask from "./create-task";

export default function TaskList({tasks}) {
    // eslint-disable-next-line
    const [ addTask ] = useAddTaskMutation()
    const [ updateTask, /*{ isLoading: isUpdating }*/ ] = useUpdateTaskMutation()
    const [group, setGroup] = useState(null);
    
    return (
        <div className="m-1 ">
            <div className="flex flex-row justify-end space-x-1">
                <CreateTask />
                <ShiftAction />  
                <TodoAction tasks={tasks}/>
                <label>
                    Regrouper par :
                    <select onChange={(e) => setGroup(e.target.value)} className="m-1">
                        <option value="0">Rien</option>
                        <option value="1">Mois</option>
                        <option value="2">Semaine</option>
                        <option value="3">Jour</option>
                        <option value="4">Heure</option>
                    </select>
                </label>
            </div>
            <table className="w-full">
                <thead>
                <tr>
                    <th></th>
                    <th>Titre</th>
                    <th>Activité</th>
                    <th>Statut</th>
                    <th>Ordre</th>
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
        </div>
    )
}