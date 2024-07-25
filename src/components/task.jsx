import { useSelector } from "react-redux";

import { useUpdateTaskMutation, useDeleteTaskMutation } from "../features/apiSlice.js";

import './task.css'
import Button from '../components/button';
import TaskRow from './task-row'

export default function Task({task, api}) {
    
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
        updateTask({id:taskId, title: title})
    };
    
    const onOrderChange = e => {
        const taskId = task.id;
        const order = e;
        api({id:taskId, order})
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

    const onDeleteClick = e => {
        const isConfirm = window.confirm('Supprimer la tâche ?');
        if (isConfirm) {
        deleteTask(task.id)
        }
        e.stopPropagation();
    }

    return <TaskRow task={task} selected={selected} 
                onTitleChange={onTitleChange} onSlotExprChange={onSlotExprChange} onOrderChange={onOrderChange}
                onActivityChange={onActivityChange}
                onStatusChange={onStatusChange} 
                button={<Button label="Delete" clickToto={onDeleteClick} />}/>;
}