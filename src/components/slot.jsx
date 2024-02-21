import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import './slot.css';
import TaskLight from "./task-light";

import { filterSlotExpr, findTaskBySlotExpr } from "../services/task"
import { selectSlot } from "../features/taskSlice";
import { useGetTasksQuery } from "../features/apiSlice.js";

export default function Slot({slot}) {
    const dispatch = useDispatch();
    
    const { id, title, start, end, inner } = slot;
    const selected = useSelector(state => state.tasks.selectedSlotId).some(slotId => slotId === id);

    const userId = useSelector(state => state.tasks.user.id);
    const { data:taskRedux, isLoading, isError } = useGetTasksQuery(userId)
    const currentTaskFilter = useSelector(state => state.tasks.currentTaskFilter);
    
    if (isLoading || isError)
        return 'Loading or Error'

    const tasks = filterSlotExpr(taskRedux, currentTaskFilter);
    const tasksInSlot = findTaskBySlotExpr(tasks, slot);

    let slotStyle = "border-2 border-gray-500 rounded p-1 m-1 ";
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

    const onSlotClick = e => {
        const slotId = slot.id;
        dispatch(
            selectSlot(slotId)
        );
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
                <Slot key={innerSlot.id} slot={innerSlot} />)}
            </div>
        </div>
        )
    }