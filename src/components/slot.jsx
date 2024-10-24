import { useState } from "react";
import { useDispatch } from "react-redux";

import './slot.css';
import TaskLight from "./task-light";

import { findTaskBySlotExpr } from "../data/task"
import { selectSlot } from "../features/taskSlice";

export default function Slot({slot, tasks, selection, handleSelection}) {
    const dispatch = useDispatch();
    
    const { id, title, path, start, end, inner } = slot;
    const [ selected, setSelected ] = useState(selection.indexOf(path) >= 0)

    if (tasks === undefined) {
        return 'error'
    }
    const tasksInSlot = findTaskBySlotExpr(tasks, slot);

    let slotStyle = "border-2 border-gray-500 rounded p-1 m-0 mt-1 mr-1 ";
    if (selected) {
        slotStyle += "bg-gray-400 ";
    } else {
        slotStyle += "bg-blue-200 ";
    }
    if (selected) {
        slotStyle += "hover:bg-gray-300 ";
    } else {
        slotStyle += "hover:bg-blue-100 ";
    }

    const onSlotClick = (e) => {
        setSelected(!selected)
        handleSelection && handleSelection(path)
    }

    const innerClass = 'ml-3' 
        + (slot.id === 'this_week' ? ' flex flex-row' : '');

    return (
        <div>
            <div className={slotStyle} onClick={onSlotClick}>
                <div className="title">{title} <span className="italic text-sm">({id})</span></div>
                {start != null && end != null && <div className="time text-xs">{start} - {end}</div>}
                { tasksInSlot.length > 0 && tasksInSlot.map(task => <TaskLight key={task.id} task={task} />)}
                <div className="h-10"/>
            </div>
            <div className={innerClass}>
                {inner != null && inner.map((innerSlot, index) => 
                <Slot key={innerSlot.id} slot={innerSlot} tasks={tasks} selection={selection} handleSelection={(val) => handleSelection && handleSelection(val)}/>)}
            </div>
        </div>
        )
    }