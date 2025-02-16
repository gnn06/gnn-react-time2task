import React from 'react';
import { useState } from "react";

import Button from "./button.jsx";
import Confirm from './Confirm.jsx'
import Dialog from '@mui/material/Dialog';

import { useUpdateTaskMutation } from "../features/apiSlice.js";

export default function TodoAction({tasks}) {

    const [ updateTask, { error: updateError } ] = useUpdateTaskMutation()

    const [todoDialog, setTodoDialog] = useState({show: false, task:[]});
    const [hideErrorDialog, setHideErrorDialog] = useState(false);

    async function onTodo() {
        setTodoDialog({show: true, tasks})
    }

    function handleTodoCancel() {
        setTodoDialog({show: false, tasks: []})
    }

    function handleTodoConfirm() {
        setTodoDialog({show: false, tasks: []})
        setHideErrorDialog(false)
        for(const t of tasks) {
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
                handleConfirm={handleTodoConfirm}
                handleCancel={handleTodoCancel}
            >
                {`Les ${todoDialog.tasks.length} tâches visibles vont être passées à 'à faire'.`}
            </Confirm> }
    </div>

}