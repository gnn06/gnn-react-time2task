import React from "react";
import './slot.css';
import Task from "./task";

export default class Slot extends React.Component {
    render() {
        const slot = this.props.slot;
        const start = this.props.slot.start;
        const end = this.props.slot.end;
        const tasks = this.props.tasks.filter(task => task.slotId != null && task.slotId === slot.id);
        return (
            <div className="bg-blue-200 border-2 border-gray-500 rounded p-1 my-1">
                <div className="title">{this.props.slot.title}</div>
                {start != null && end != null && <div className="time text-xs">{this.props.slot.start} - {this.props.slot.end}</div>}
                {this.props.slot.inner != null && this.props.slot.inner.map((innerSlot, index) => 
                    <Slot key={innerSlot.id} slot={innerSlot} tasks={this.props.tasks}/>)
                }
                { tasks.length > 0 && tasks.map(task => <Task task={task} />)}
                <div className="h-10"/>
            </div>
        )
    }
}