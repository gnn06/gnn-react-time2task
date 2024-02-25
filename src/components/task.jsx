import { useUpdateTaskMutation, useDeleteTaskMutation } from "../features/apiSlice.js";
import { useSelector } from "react-redux";

import './task.css'
import { slotIdList } from "../services/slot-path.js";

import Button from '../components/button';
import SyntaxInput from './syntax-input';
import StatusInput from './status-input.jsx'
import InputEdit from "./edit-input.jsx";

export default function Task({task}) {
    
    const selected = useSelector(state => state.tasks.selectedTaskId).some(taskId => taskId === task.id);
    const [
        updateTask, // This is the mutation trigger
        // eslint-disable-next-line
        { isLoading: isUpdating }, // This is the destructured mutation result
      ] = useUpdateTaskMutation()
    
    const [ deleteTask ] = useDeleteTaskMutation()

    const myClassName = 'rounded p-1 my-1 '
        + (selected ? 
           'hover:bg-gray-300  bg-gray-400  border-gray-500 border-2'
         : 'hover:bg-green-100 bg-green-200 border-gray-500 border-2');

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
        const order = Number(e.target.value);
        updateTask({id:taskId, order})
    };

    const onDeleteClick = e => {
        const isConfirm = window.confirm('Supprimer la tâche ?');
        if (isConfirm) {
            deleteTask(task.id)
        }
        e.stopPropagation();
    }

    return <tr className={myClassName} >
            <td><InputEdit defaultValue={task.title} saveHandler={onTitleChange} className="w-full"/></td>
            <td>                
                <SyntaxInput initialInputValue={task.slotExpr} classNameInput="bg-transparent" items={slotIdList}
                    onInputChange={onSlotExprChange}/>
            </td>
            <td><InputEdit defaultValue={task.order} saveHandler={onOrderChange} className="w-10"/></td>
            <td><StatusInput task={task}/></td>
            <td><Button label="Delete" clickToto={onDeleteClick} /></td>
        </tr>;
}