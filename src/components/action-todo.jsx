import React from 'react';
import { useState } from "react";
import { useSelector } from "react-redux";

import Button from "./button.jsx";
import Confirm from './Confirm.jsx'
import Dialog from '@mui/material/Dialog';

import { useUpdateTaskMutation } from "../features/apiSlice.js";
import { filterSlotExpr } from '../data/task.js';

export default function TodoAction({tasks}) {

    const [ updateTask, { error: updateError } ] = useUpdateTaskMutation()

    const currentTaskFilter = useSelector(state => state.tasks.currentTaskFilter);
    const [todoDialog, setTodoDialog] = useState({show: false, task:[]});
    const [hideErrorDialog, setHideErrorDialog] = useState(false);

    async function onTodo() {
        const tasksFilter = filterSlotExpr(tasks, currentTaskFilter);
        setTodoDialog({show: true, tasks: tasksFilter})
    }

    function handleTodoCancel() {
        setTodoDialog({show: false, tasks: []})
    }

    function handleTodoConfirm() {
        setTodoDialog({show: false, tasks: []})
        setHideErrorDialog(false)
        const tasksFilter = filterSlotExpr(tasks, currentTaskFilter);
        for(const t of tasksFilter) {
            updateTask({id: t.id, status: 'A faire'})
        }
    }

    function handleErrorDialogConfirm() {
        setHideErrorDialog(true)
    }

    return <div>
        <Button label="Todo" clickToto={onTodo}/>
        { updateError && !hideErrorDialog &&
                    <Dialog open={true}>
                        <div className='p-3'>
                            <div className='text-xl mb-3'>Une erreur est survenue</div>
                            {updateError.data.message}
                            <div className='flex flex-row justify-end space-x-1 mt-5'>
                                <Button label="OK" clickToto={handleErrorDialogConfirm} />
                            </div>
                        </div>
                    </Dialog> }
        { todoDialog.show && 
            <Confirm 
                titre="Confirmez-vous le passage à l'état 'à faire' ?" 
                contenu={`Les ${todoDialog.tasks.length} tâches visibles vont être passées à 'à faire'.`}
                handleConfirm={handleTodoConfirm}
                handleCancel={handleTodoCancel} /> }
    </div>

}