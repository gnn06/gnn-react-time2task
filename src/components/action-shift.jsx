import React, { useEffect } from 'react';
import { useState } from "react";
import Dialog from '@mui/material/Dialog';
import Select from 'react-select';
import { useSelector } from "react-redux";

import Button from "./button";
import Confirm from './Confirm'

import { useGetSnapDatesQuery, useUpdateSnapDateMutation, useUpdateTaskMutation } from "../features/apiSlice.js";
import { useGetTasksQuery } from "../features/apiSlice.js";
import { taskShiftFilter } from '../data/task.js';
import { getSlotIdFirstLevel, getSlotIdLevel } from '../data/slot-id';
import { getSnapDateToShow, getSnapDateToSave } from '../data/slot-date';
import SlotAnimate from './slot-animation';
import { Stack } from '@mui/material';

const options = [{ value: 'week', label: 'week'}, { value: 'month', label: 'month'}]

export default function ShiftAction() {

    const [shiftDialog, setShiftDialog] = useState(false);
    const [hideErrorDialog, setHideErrorDialog] = useState(false);
    const [level, setLevel] = useState(options[0]);

    const userId   = useSelector(state => state.tasks.user.id);
    const activity = useSelector(state => state.tasks.currentActivity);
    
    const { data:tasksRedux, isLoading } = useGetTasksQuery({userId, activity})
    const [ updateTask, { error: updateError } ] = useUpdateTaskMutation()

    const { data:snapDates, isSuccess:isSuccessSnapDates }= useGetSnapDatesQuery()    
    const [ updateSnapDate ] = useUpdateSnapDateMutation()

    const [ snapDate, setSnapDate ] = useState(getSnapDateToShow(level.value, snapDates))

    useEffect(() => {
        if (isSuccessSnapDates) {
            setSnapDate(getSnapDateToShow(level.value, snapDates))
        }
    }, [isSuccessSnapDates, level.value, snapDates])

    function onShift() {
        setShiftDialog(true)
    }

    function handleChangeLevel(value) {
        setLevel(value)
        setSnapDate(getSnapDateToShow(value.value, snapDates))
    }

    function handleShiftCancel() {
        setShiftDialog(false)
    }

    async function handleShiftConfirm() {
        setShiftDialog(false)
        setHideErrorDialog(false)
        for (const item of shiftedTasks) {
            updateTask({id: item.id, slotExpr: item.slotExpr})
            // console.log(item.id, item.title, 'old=', item.oldSlotExpr, 'new=', item.slotExpr)
        }
        const snapDateToSave = getSnapDateToSave(level.value, snapDate)
        const snapSlotID = getSlotIdFirstLevel(getSlotIdLevel(level.value));
        //console.log("updateSnapDate", snapSlotID, snapDateToSave)
        updateSnapDate({id: snapSlotID, slotid: snapSlotID, date: snapDateToSave})
    }

    function handleErrorDialogConfirm() {
        setHideErrorDialog(true)
    }


    function handleDate(date) {
        setSnapDate(date.target.value)
    }

    if (isLoading) return;

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
            handleConfirm={handleShiftConfirm}
            handleCancel={handleShiftCancel} >
                <Stack direction="row" spacing={1}>
                    <div>
                        <label htmlFor='level' className='flex flex-row items-baseline' >Niveau de créneau à décaler : 
                            <Select className="ml-2" name="level" options={options} defaultValue={level} onChange={handleChangeLevel}/>
                        </label>
                        Before / last shift : { isSuccessSnapDates && getSlotIdFirstLevel(getSlotIdLevel(level.value)) } = { isSuccessSnapDates && <input key={level.value} value={snapDate} onChange={handleDate}/> }
                        After shift :  { isSuccessSnapDates && getSlotIdFirstLevel(getSlotIdLevel(level.value)) } =  { isSuccessSnapDates && getSnapDateToSave(level.value, snapDate) }
                        <div className='mt-3'>{`${shiftedTasks.length} tâches vont être décalées sur le créneau précédent (next devient this, following devient next, next + 3 devient next + 2 et every 2  this devient every 2 following).`}</div>    
                    </div>
                    <SlotAnimate/>
                </Stack>
                <div className="grid grid-cols-3 gap-4 mt-5 overflow-auto max-h-80">
                    { shiftedTasks.map(t => (<React.Fragment key={t.id}><div>{t.title}</div><div className='font-mono'>{t.oldSlotExpr}</div><div className='font-mono'>{t.slotExpr}</div></React.Fragment>)) }
                </div>
        </Confirm> }
        </div>
}