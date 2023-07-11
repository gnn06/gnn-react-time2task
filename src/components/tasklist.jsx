import React from "react";
import { useSelector } from "react-redux";
import Task from './task';
import AddTaskForm from "../features/AddTaskForm";

function filterNoSlot(tasks) {
    return tasks.filter(task => task.slotId == null);
}

export default function TaskList() {
    const taskRedux = useSelector(state => state.tasks.tasks);
    const tasks = filterNoSlot(taskRedux);
    return (
        <div className="m-1">
            <h1>Tasks</h1>
            {tasks.map((task, index) => <Task key={task.id} task={task} />)}
            <AddTaskForm />
        </div>
        )        
    }