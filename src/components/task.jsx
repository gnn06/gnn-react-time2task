import { useSelector } from "react-redux";

import { useUpdateTaskMutation, useDeleteTaskMutation } from "../features/apiSlice.js";
import { getExprKeywords, isSlotUnique } from "../data/slot-path.js";

import './task.css'
import Button from '../components/button';
import SyntaxInput from './syntax-input';
import StatusInput from './status-input.jsx'
import InputEdit from "./edit-input.jsx";
import LooksOneIcon from '@mui/icons-material/LooksOneOutlined';
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
                onStatusChange={onStatusChange} 
                button={<Button label="Delete" clickToto={onDeleteClick} />}/>;
}