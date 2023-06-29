import React from "react";
import { useSelector } from "react-redux";
import Task from './task';

export default function TaskList() {
    const taskRedux = useSelector(state => state.task.tasks);
    const tasks = taskRedux
        .filter(task => task.slotId == null);
    return (
        <div className="m-1">
            <h1>Tasks</h1>
            {tasks.map((task, index) => <Task key={task.id} task={task} />)}
        </div>
        )        
    }