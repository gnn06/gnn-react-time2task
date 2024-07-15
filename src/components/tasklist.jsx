import React from 'react';
import { useState } from "react";
import { useSelector } from "react-redux";
import TaskGroup from "../components/task-group";
import TaskNew from './task-new';

import { filterSlotExpr } from '../data/task.js';
import { useGetTasksQuery, useAddTaskMutation, useUpdateTaskMutation } from "../features/apiSlice.js";
import ShiftAction from './action-shift';
import TodoAction from './action-todo';

export default function TaskList() {
    // eslint-disable-next-line
    const userId   = useSelector(state => state.tasks.user.id);
    const activity = useSelector(state => state.tasks.currentActivity);
    const { data:tasksRedux, isLoading, isSuccess } = useGetTasksQuery({userId, activity})
    const [ addTask ] = useAddTaskMutation()
    const [ updateTask, /*{ isLoading: isUpdating }*/ ] = useUpdateTaskMutation()
    const currentTaskFilter = useSelector(state => state.tasks.currentTaskFilter);
    const [group, setGroup] = useState(null);
    
    if (!isLoading && isSuccess) {
        const tasksFetched = tasksRedux.slice();
        const tasks = filterSlotExpr(tasksFetched, currentTaskFilter);
        return (
            <div className="m-1 ">
                <div className="flex flex-row justify-end space-x-1">
                    <ShiftAction tasks={tasksRedux}/>  
                    <TodoAction tasks={tasksRedux}/>
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
                        <th>Titre</th>
                        <th>Créneau (expression)</th>
                        <th>Ordre</th>
                        <th>Activité</th>
                        <th>Statut</th>
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
    }