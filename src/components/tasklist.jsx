import React from "react";
import { useSelector } from "react-redux";
import Task from './task';
import AddTaskForm from "../features/AddTaskForm";
import TaskFilter from "./task-filter.jsx";

import { filterSlotExpr } from './domainDataUtil';
import { useGetTasksQuery } from "../features/apiSlice.js";

export default function TaskList() {
    const { data, isLoading, isSuccess, isError, error } = useGetTasksQuery()
    const currentTaskFilter = useSelector(state => state.tasks.currentTaskFilter);
    
    if (!isLoading && isSuccess) {
        const tasksFetched = data.records.map(item => ({ id: item.id, title: item.fields.Sujet, slotExpr: item.fields.slotExpr }));
        const tasks = filterSlotExpr(taskRedux, currentTaskFilter);
    
        return (
            <div className="m-1 basis-1/2">
                <TaskFilter/>
                <h1>Tasks</h1>
                <table className="w-full">
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
    }