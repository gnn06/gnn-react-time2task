import React from 'react';
import { useState } from "react";
import { useSelector } from "react-redux";
import Dialog from '@mui/material/Dialog';
import Select from 'react-select';

import Button from "./button";
import Confirm from './Confirm'

import { useGetTasksQuery, useUpdateTaskMutation } from "../features/apiSlice.js";
import { taskShiftFilter } from '../data/task.js';

const options = [{ value: 'week', label: 'week'}, { value: 'month', label: 'month'}]

export default function ShiftAction() {

    const [shiftDialog, setShiftDialog] = useState(false);
    const [hideErrorDialog, setHideErrorDialog] = useState(false);
    const [level, setLevel] = useState(options[0]);

    const userId = useSelector(state => state.tasks.user.id);
    const { data:tasksRedux, isLoading, isSuccess } = useGetTasksQuery(userId)
    const [ updateTask, { error: updateError } ] = useUpdateTaskMutation()

    function onShift() {
        setShiftDialog(true)
    }

    function handleChangeLevel(value) {
        setLevel(value)
    }

    function handleShiftCancel() {
        setShiftDialog(false)
    }

    async function handleShiftConfirm() {
        setShiftDialog(false)
        setHideErrorDialog(false)
        for (const item of shiftedTasks) {
            updateTask({id: item.id, slotExpr: item.slotExpr})
            console.log(item.id, item.title, 'old=', item.oldSlotExpr, 'new=', item.slotExpr)
        }
    }

    function handleErrorDialogConfirm() {
        setHideErrorDialog(true)
    }    

    const shiftedTasks = shiftDialog ? taskShiftFilter(tasksRedux, level.value) : []


    return <div>
        <Button label="Shift" clickToto={onShift}/>
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
        { shiftDialog && 
        <Confirm 
            titre="Confirmez-vous le décalage des tâches ?" 
            contenu={<>
                <label htmlFor='level' className='flex flex-row items-baseline' >Niveau de créneau à décaler : 
                    <Select className="ml-2" name="level" options={options} defaultValue={level} onChange={handleChangeLevel}/>
                </label>
                <div className='mt-3'>{`${shiftedTasks.length} tâches vont être décalées sur le créneau précédent (next devient this, following devient next, next + 3 devient next + 2 et every 2  this devient every 2 following).`}</div>    
                <div className="grid grid-cols-3 gap-4 mt-5 ">
                    { shiftedTasks.map(t => (<React.Fragment><div>{t.title}</div><div className='font-mono'>{t.oldSlotExpr}</div><div className='font-mono'>{t.slotExpr}</div></React.Fragment>)) }
                </div>
                </>}
            handleConfirm={handleShiftConfirm}
            handleCancel={handleShiftCancel} /> }
        </div>
}