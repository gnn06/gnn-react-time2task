import { useDispatch, useSelector } from "react-redux";

import { useUpdateTaskMutation, useDeleteTaskMutation } from "../features/apiSlice.js";

import './task.css'
import Button from '../components/button';
import TaskRow from './task-row'
import { selectTask } from "../features/taskSlice.js";

export default function Task({task, api}) {
    
    const dispatch = useDispatch();
    const selected = useSelector(state => state.tasks.selectedTaskId).some(taskId => taskId === task.id);
    const [
        updateTask, // This is the mutation trigger
        // eslint-disable-next-line
        { isLoading: isUpdating }, // This is the destructured mutation result
      ] = useUpdateTaskMutation()
    
    const [ deleteTask ] = useDeleteTaskMutation()

    const onSlotExprChange = e => {
        const taskId = task.id;
        const slotExpr = e;
        updateTask({id:taskId, slotExpr})
    };

    const onTitleChange = (e) => {
        const taskId = task.id;
        const title = e.target.value;
        api({id:taskId, title: title})
    };
    
    const onActivityChange = activity => {
        const taskId = task.id;
        if (activity === '' || activity === null) { activity = null } else { activity = Number(activity) }
        api({id:taskId, activity})
    };

    const onStatusChange = (value) => {
        const taskId = task.id;
        updateTask({id:taskId, status: value})
    };

    const onTaskClick = () => {
        const taskId = task.id;
        dispatch(selectTask(taskId))
    }

    return <TaskRow task={task} selected={selected}
                onTitleChange={onTitleChange} onSlotExprChange={onSlotExprChange} 
                onActivityChange={onActivityChange}
                onStatusChange={onStatusChange} 
                onTaskClick={onTaskClick} />;
}