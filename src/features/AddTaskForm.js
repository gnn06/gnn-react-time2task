import React, { useState } from "react";

import Button from '../components/button';

import { useAddTaskMutation } from "../features/apiSlice.js";
import { useDispatch } from "react-redux";
import { setTasks, sortTasks } from "../features/taskSlice";
import { add } from './taskSlice';

export default function AddTaskForm() {

    const [title, setTitle] = useState('');

    const [
        addTask
      ] = useAddTaskMutation()
    const onTitleChange = e => setTitle(e.target.value);

    const onSaveTaskClicked = () => {
        addTask({title})
        setTitle('');
    };

    const onImportAirtableClicked = () => {
        getAllTasksP().then(result => dispatch(setTasks(result)))
    };

    const onResetClicked = () => {
        dispatch(setTasks([]))
    };

    const onSortClicked = () => {
        dispatch(sortTasks())
    };
    return(
        <div>
            <form>
                <label htmlFor="taskTitle">Titre : </label>
                <input type="text"
                    id="taskTitle"
                    name="taskTile"
                    value={title}
                    onChange={onTitleChange}
                />
            </form>
            <Button clickToto={onSaveTaskClicked} label="Sauver la Tâche" />
            <Button clickToto={onImportAirtableClicked} label="Importer Airtable" />
            <Button clickToto={onResetClicked} label="Reset tasks" />
            <Button clickToto={onSortClicked} label="Sort" />
        </div>
    )
}