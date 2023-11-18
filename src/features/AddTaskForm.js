import React, { useState } from "react";
import { useDispatch } from "react-redux";

import Button from '../components/button';

import { add } from './taskSlice';
import { useAddTaskMutation, useSetSlotExprMutation } from "../features/apiSlice.js";

export default function AddTaskForm() {

    const [title, setTitle] = useState('');

    const dispatch = useDispatch();
    const [
        addTask, // This is the mutation trigger
        { isLoading: isUpdating }, // This is the destructured mutation result
      ] = useAddTaskMutation()
    const onTitleChange = e => setTitle(e.target.value);

    const onSaveTaskClicked = () => {
        addTask({title})
        setTitle('');
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
        </div>
    )
}