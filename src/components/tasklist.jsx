import React from 'react';
import { useState } from "react";
import { useSelector } from "react-redux";
import AddTaskForm from "../components/AddTaskForm";
import TaskGroup from "../components/task-group";

import { filterSlotExpr } from '../data/task.js';
import { useGetTasksQuery } from "../features/apiSlice.js";
import ShiftAction from './action-shift';
import TodoAction from './action-todo';

export default function TaskList() {
    // eslint-disable-next-line
    const userId = useSelector(state => state.tasks.user.id);
    const { data:tasksRedux, isLoading, isSuccess } = useGetTasksQuery(userId)
    const currentTaskFilter = useSelector(state => state.tasks.currentTaskFilter);
    const [group, setGroup] = useState(null);
    
    if (!isLoading && isSuccess) {
        const tasksFetched = tasksRedux.slice();
        const tasks = filterSlotExpr(tasksFetched, currentTaskFilter);
        return (
            <div className="m-1 ">
                <div className="flex flex-row justify-end space-x-1">
                    <ShiftAction/>  
                    <TodoAction/>
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
                        <th>Statut</th>
                        <th></th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                        <TaskGroup tasks={tasks} group={group}/>
                    </tbody>
                </table>
                { `${tasks.length} tâche(s)` }
                <AddTaskForm />
            </div>
            )        
        }
    }