import React from "react";
import { useSelector } from "react-redux";
import Task from './task';
import AddTaskForm from "../features/AddTaskForm";
import TaskFilter from "./task-filter.jsx";

import { filterSlotExpr } from './domainDataUtil';
import { useGetTasksQuery } from "../features/apiSlice.js";

export default function TaskList() {
    // eslint-disable-next-line
    const { data:tasksRedux, isLoading, isSuccess, isError, error } = useGetTasksQuery()
    const currentTaskFilter = useSelector(state => state.tasks.currentTaskFilter);

    if (!isLoading && isSuccess) {
        const tasks = filterSlotExpr(tasksRedux, currentTaskFilter);
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
    } else {
        return 'loading'
    }
}