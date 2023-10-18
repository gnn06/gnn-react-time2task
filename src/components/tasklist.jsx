import React from "react";
import { useSelector } from "react-redux";
import Task from './task';
import AddTaskForm from "../features/AddTaskForm";
import TaskFilter from "./task-filter.jsx";

import { filterSlotExpr } from './domainDataUtil';

export default function TaskList() {
    const taskRedux = useSelector(state => state.tasks.tasks);
    const currentTaskFilter = useSelector(state => state.tasks.currentTaskFilter);
    
    const tasks = filterSlotExpr(taskRedux, currentTaskFilter);
    //console.log('filterSlotExpr', currentTaskFilter, tasks.length);
    
    return (
        <div className="m-1">
            <TaskFilter/>
            <h1>Tasks</h1>
            <table>
                <thead>
                <tr><th>Titre</th><th>Créneau (expression)</th></tr>
                </thead>
                <tbody>
                {tasks.map((task, index) => <Task key={task.id} task={task} />)}
                </tbody>
            </table>
            <AddTaskForm />
        </div>
        )        
    }