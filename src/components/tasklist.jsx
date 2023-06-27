import React from "react";
import Task from './task';

export default class TaskList extends React.Component {
    render() {
        const tasks = this.props.tasks
            .filter(task => task.slotId == null);
        return (
            <div className="m-1">
                <h1>Tasks</h1>
                {tasks.map((task, index) => <Task key={task.id} task={task} />)}
            </div>
        )
    }
}