import React from 'react';
import { useState } from "react";
import { useSelector } from "react-redux";
import AddTaskForm from "../components/AddTaskForm";
import TaskGroup from "../components/task-group";

import { filterSlotExpr, taskShiftFilter } from '../data/task.js';
import { useGetTasksQuery, useUpdateTaskMutation } from "../features/apiSlice.js";
import Button from "./button";
import Confirm from './Confirm'
import Dialog from '@mui/material/Dialog';

export default function TaskList() {
    // eslint-disable-next-line
    const userId = useSelector(state => state.tasks.user.id);
    const { data:tasksRedux, isLoading, isSuccess } = useGetTasksQuery(userId)
    const [ updateTask, { error: updateError } ] = useUpdateTaskMutation()
    const currentTaskFilter = useSelector(state => state.tasks.currentTaskFilter);
    const [group, setGroup] = useState(null);
    const [shiftDialog, setShiftDialog] = useState({show: false, tasks: []});
    const [todoDialog, setTodoDialog] = useState({show: false, task:[]});
    const [hideErrorDialog, setHideErrorDialog] = useState(false);
    
    function onShift() {
        const tasks = tasksRedux/*.filter(item => item.id == 38)*/
        const shiftedTasks = taskShiftFilter(tasks)
        setShiftDialog({show:true, tasks : shiftedTasks})
    }

    function handleShiftCancel() {
        setShiftDialog({show: false, tasks: []})
    }

    async function handleShiftConfirm() {
        setShiftDialog({show: false, tasks : []})
        setHideErrorDialog(false)
        for (const item of shiftDialog.tasks) {
            updateTask({id: item.id, slotExpr: item.slotExpr})
        }
    }

    async function onTodo() {
        const tasks = filterSlotExpr(tasksRedux, currentTaskFilter);
        setTodoDialog({show: true, tasks: tasks})
    }

    function handleTodoCancel() {
        setTodoDialog({show: false, tasks: []})
    }

    function handleTodoConfirm() {
        setTodoDialog({show: false, tasks: []})
        setHideErrorDialog(false)
        const tasks = filterSlotExpr(tasksRedux, currentTaskFilter);
        for(const t of tasks) {
            updateTask({id: t.id, status: 'A faire'})
        }
    }

    function handleErrorDialogConfirm() {
        setHideErrorDialog(true)
    }

    if (!isLoading && isSuccess) {
        const tasksFetched = tasksRedux.slice();
        const tasks = filterSlotExpr(tasksFetched, currentTaskFilter);
        return (
            <div className="m-1 ">
                <div className="flex flex-row justify-end space-x-1">
                    <Button label="Shift" clickToto={onShift}/>
                    <Button label="Todo" clickToto={onTodo}/>
                    <label>
                        Regrouper par :
                        <select onChange={(e) => setGroup(e.target.value)} className="m-1">
                            <option value="0">Rien</option>
                            <option value="1">Mois</option>
                            <option value="2">Semaine</option>
                            <option value="3">Jour</option>
                            <option value="4">Heure</option>
                        </select>
                    </label>
                </div>
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
                { shiftDialog.show && 
                    <Confirm 
                        titre="Confirmez-vous le décalage des tâches ?" 
                        contenu={<><div>{`${shiftDialog.tasks.length} tâches vont être décalées sur le créneau précédent (next devient this, following devient next and EVERY2 this devient EVERY2 following).`}</div>
                                <div className="grid grid-cols-3 gap-4 mt-5 ">
                                { shiftDialog.tasks.map(t => (<React.Fragment><div>{t.title}</div><div className='font-mono'>{t.oldSlotExpr}</div><div className='font-mono'>{t.slotExpr}</div></React.Fragment>)) }
                                </div>
                            </>}
                        handleConfirm={handleShiftConfirm}
                        handleCancel={handleShiftCancel} /> }
                { todoDialog.show && 
                    <Confirm 
                        titre="Confirmez-vous le passage à l'état 'à faire' ?" 
                        contenu={`Les ${todoDialog.tasks.length} tâches visibles vont être passées à 'à faire'.`}
                        handleConfirm={handleTodoConfirm}
                        handleCancel={handleTodoCancel} /> }
                <table className="w-full">
                    <thead>
                    <tr>
                        <th>Titre</th>
                        <th>Créneau (expression)</th>
                        <th>Ordre</th>
                        <th>Statut</th>
                        <th></th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                        <TaskGroup tasks={tasks} group={group}/>
                    </tbody>
                </table>
                { `${tasks.length} tâche(s)` }
                <AddTaskForm />
            </div>
            )        
        }
    }